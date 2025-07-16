/**
 * Service de gestion des candidatures aux tâches
 *
 * Ce service gère le cycle complet des candidatures :
 * - Postulation à une tâche
 * - Acceptation/refus par le propriétaire
 * - Completion du travail par le candidat
 * - Validation finale par le propriétaire
 *
 * Architecture : Hérite de GenericService pour les opérations CRUD de base
 */
import { TaskApplicationModel } from '../../db/model/TaskApplicationModel';
import { TaskModel } from '../../db/model/TaskModel';
import { ApplicationStatus, TaskStatus } from '../../types/graphql/typeDefs';
import GenericService from '../@generic';
import { generateVerificationCode } from '../../shared/generateVerificationCode';
import TasksService from '../tasks';
import TaskMessageService from '../task-messages';
import TaskNotificationService from '../notifications/task-notifications';

class TaskApplicationService extends GenericService<TaskApplicationModel> {
  constructor() {
    super(TaskApplicationModel);
  }

  /**
   * Permet à un utilisateur de postuler à une tâche publiée
   *
   * @param taskId - ID de la tâche
   * @param applicantId - ID du candidat
   * @param message - Message de motivation
   * @returns La candidature créée
   */
  public async applyToTask(taskId: string, applicantId: string, message: string): Promise<TaskApplicationModel> {
    // Validation de la tâche
    await this.validateTaskForApplication(taskId);

    // Vérification de candidature unique
    await this.checkUniqueApplication(taskId, applicantId);

    // Création de la candidature avec code de validation unique
    const application = await this.save({
      input: {
        applicantId,
        message,
        status: ApplicationStatus.Pending,
        taskId,
        validationCode: generateVerificationCode(),
      },
    });

    // Créer une notification pour le propriétaire de la tâche
    const task = await TaskModel.query().findById(taskId);
    if (task) {
      const applicant = await import('../users').then((m) => m.default.findById(applicantId));
      const applicantName = applicant ? `${applicant.firstName} ${applicant.lastName}`.trim() : 'Un candidat';

      await TaskNotificationService.notifyTaskApplicationReceived(
        task.userId,
        task.title,
        applicantName,
        console // logger temporaire
      );
    }

    return application;
  }

  /**
   * Accepte une candidature et met la tâche en cours
   *
   * @param applicationId - ID de la candidature
   * @param taskOwnerId - ID du propriétaire de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La candidature acceptée
   */
  public async acceptApplication(
    applicationId: string,
    taskOwnerId: string,
    userLogger?: any
  ): Promise<TaskApplicationModel> {
    const application = await this.validateApplicationForAction(applicationId, taskOwnerId, 'accepter');

    // Accepter la candidature
    const acceptedApplication = await this.save({
      id: applicationId,
      input: { status: ApplicationStatus.Accepted },
    });

    // Actions post-acceptation
    await this.handleApplicationAcceptance(application);

    // Créer une notification pour le candidat accepté
    const task = await TaskModel.query().findById(application.taskId);

    if (task) {
      await TaskNotificationService.notifyTaskApplicationAccepted(
        application.applicantId,
        task.title,
        userLogger || console
      );
    }

    return acceptedApplication;
  }

  /**
   * Refuse une candidature avec une raison
   *
   * @param applicationId - ID de la candidature
   * @param reason - Raison du refus
   * @param taskOwnerId - ID du propriétaire de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La candidature refusée
   */
  public async rejectApplication(
    applicationId: string,
    reason: string,
    taskOwnerId: string,
    userLogger?: any
  ): Promise<TaskApplicationModel> {
    const application = await this.validateApplicationForAction(applicationId, taskOwnerId, 'refuser');

    // Refuser la candidature
    const rejectedApplication = await this.save({
      id: applicationId,
      input: { status: ApplicationStatus.Rejected },
    });

    // Notifier le candidat refusé
    await TaskMessageService.sendSystemMessage(
      application.taskId,
      application.applicantId,
      `Votre candidature a été refusée. Raison : ${reason}`
    );

    // Créer une notification pour le candidat refusé
    const task = await TaskModel.query().findById(application.taskId);
    if (task) {
      await TaskNotificationService.notifyTaskApplicationRejected(
        application.applicantId,
        task.title,
        reason,
        userLogger || console
      );
    }

    return rejectedApplication;
  }

  /**
   * Marque une tâche comme démarrée par le candidat
   *
   * @param taskId - ID de la tâche
   * @param applicantId - ID du candidat
   * @returns La tâche démarrée
   */
  public async startTask(taskId: string, applicantId: string): Promise<TaskModel> {
    const task = await this.validateTaskExists(taskId);
    const application = await this.validateAcceptedApplicationForStart(taskId, applicantId);

    // Marquer la candidature comme démarrée
    await this.save({
      id: application.id,
      input: {
        startedAt: new Date().toISOString(),
        status: ApplicationStatus.Accepted, // On garde Accepted mais on ajoute startedAt
      },
    });

    // Marquer la tâche comme en cours
    const startedTask = await TasksService.updateTaskStatus(taskId, TaskStatus.InProgress);

    // Notifier le propriétaire
    await TaskMessageService.sendSystemMessage(taskId, task.userId, 'Le travail a commencé sur votre tâche.');

    return startedTask;
  }

  /**
   * Marque une tâche comme complétée par le CLIENT (propriétaire de la tâche)
   *
   * @param taskId - ID de la tâche
   * @param taskOwnerId - ID du propriétaire de la tâche (CLIENT)
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche complétée
   */
  public async completeTask(taskId: string, taskOwnerId: string, userLogger?: any): Promise<TaskModel> {
    await this.validateTaskExists(taskId);
    const application = await this.validateStartedApplicationForClient(taskId, taskOwnerId);

    // Marquer la candidature comme complétée
    await this.save({
      id: application.id,
      input: {
        completedAt: new Date().toISOString(),
        status: ApplicationStatus.Completed,
      },
    });

    // Marquer la tâche comme complétée
    const completedTask = await TasksService.updateTaskStatus(taskId, TaskStatus.Completed);

    // Notifier le prestataire et envoyer le code de validation
    await this.notifyTaskCompletion(taskId, application);

    // Créer une notification pour le prestataire
    const task = await TaskModel.query().findById(taskId);
    await TaskNotificationService.notifyTaskCompleted(
      application.applicantId,
      task.title,
      application.validationCode || '',
      userLogger || console
    );

    return completedTask;
  }

  /**
   * Valide la completion d'une tâche par le PRESTATAIRE (confirme la réception)
   *
   * @param taskId - ID de la tâche
   * @param validationCode - Code de validation fourni par le client
   * @param applicantId - ID du prestataire (candidat)
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche validée
   */
  public async validateTaskCompletion(
    taskId: string,
    validationCode: string,
    applicantId: string,
    userLogger?: any
  ): Promise<TaskModel> {
    // Vérifier que c'est bien le prestataire qui valide
    await this.validateTaskForValidationByApplicant(taskId, applicantId);

    // Vérifier que le code de validation correspond à une candidature complétée
    const application = await this.validateCompletedApplication(taskId, validationCode);

    // Vérifier que le validateur est bien le prestataire de cette tâche
    if (application.applicantId !== applicantId) {
      throw new Error('Code de validation invalide pour cette tâche');
    }

    // Marquer la candidature comme validée
    await this.save({
      id: application.id,
      input: {
        status: ApplicationStatus.Validated,
        validatedAt: new Date().toISOString(),
      },
    });

    // Marquer la tâche comme terminée
    const validatedTask = await TasksService.updateTaskStatus(taskId, TaskStatus.Done);

    // Notifier le client de la validation
    const task = await TaskModel.query().findById(taskId);

    await TaskMessageService.sendSystemMessage(
      taskId,
      task.userId,
      'Le prestataire a confirmé la réception. La tâche est maintenant terminée !'
    );

    // Créer une notification pour le client
    await TaskNotificationService.notifyTaskValidated(task.userId, task.title, userLogger || console);

    return validatedTask;
  }

  /**
   * Récupère les candidatures d'un utilisateur
   *
   * @param applicantId - ID du candidat
   * @returns Liste des candidatures avec détails des tâches
   */
  public async getMyApplications(applicantId: string): Promise<TaskApplicationModel[]> {
    const applications = await TaskApplicationModel.query()
      .where('applicant_id', applicantId)
      .withGraphFetched('[task.[category, address, shipping, user]]')
      .orderBy('created_at', 'desc');

    return applications;
  }

  /**
   * Récupère les candidatures pour une tâche spécifique
   *
   * @param taskId - ID de la tâche
   * @returns Liste des candidatures avec détails des candidats
   */
  public async getTaskApplications(taskId: string): Promise<TaskApplicationModel[]> {
    return await TaskApplicationModel.query()
      .where('task_id', taskId)
      .withGraphFetched('[applicant, task]')
      .orderBy('created_at', 'desc');
  }

  // =============================================================================
  // MÉTHODES PRIVÉES - Validation et logique métier
  // =============================================================================

  /**
   * Valide qu'une tâche peut recevoir des candidatures
   */
  private async validateTaskForApplication(taskId: string): Promise<TaskModel> {
    const task = await TaskModel.query().findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    if (task.status !== TaskStatus.Published) {
      throw new Error('Impossible de postuler à cette tâche');
    }

    return task;
  }

  /**
   * Vérifie qu'un utilisateur n'a pas déjà postulé
   */
  private async checkUniqueApplication(taskId: string, applicantId: string): Promise<void> {
    const existingApplication = await this.findOne({
      applicantId,
      taskId,
    });

    if (existingApplication) {
      throw new Error('Vous avez déjà postulé à cette tâche');
    }
  }

  /**
   * Valide une candidature pour une action (accepter/refuser)
   */
  private async validateApplicationForAction(
    applicationId: string,
    taskOwnerId: string,
    action: string
  ): Promise<TaskApplicationModel> {
    const application = await this.findById(applicationId);
    if (!application) {
      throw new Error('Candidature non trouvée');
    }

    const task = await TaskModel.query().findById(application.taskId);
    if (!task || task.userId !== taskOwnerId) {
      throw new Error(`Vous n'êtes pas autorisé à ${action} cette candidature`);
    }

    if (application.status !== ApplicationStatus.Pending) {
      throw new Error(`Cette candidature ne peut plus être ${action}ée`);
    }

    return application;
  }

  /**
   * Gère les actions post-acceptation d'une candidature
   */
  private async handleApplicationAcceptance(application: TaskApplicationModel): Promise<void> {
    // Mettre la tâche en cours
    await TasksService.updateTaskStatus(application.taskId, TaskStatus.InProgress);

    // Rejeter toutes les autres candidatures
    await TaskApplicationModel.query()
      .where('task_id', application.taskId)
      .where('id', '!=', application.id)
      .patch({ status: ApplicationStatus.Rejected });

    // Notifier le candidat accepté
    await TaskMessageService.sendSystemMessage(
      application.taskId,
      application.applicantId,
      'Votre candidature a été acceptée ! Vous pouvez maintenant commencer le travail.'
    );
  }

  /**
   * Valide qu'une tâche existe
   */
  private async validateTaskExists(taskId: string): Promise<TaskModel> {
    const task = await TaskModel.query().findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }
    return task;
  }

  /**
   * Valide une candidature acceptée pour completion
   */
  private async validateAcceptedApplication(
    taskId: string,
    applicantId: string,
    validationCode: string
  ): Promise<TaskApplicationModel> {
    const application = await this.findOne({
      applicantId,
      status: ApplicationStatus.Accepted,
      taskId,
    });

    if (!application) {
      throw new Error("Vous n'êtes pas autorisé à compléter cette tâche");
    }

    if (application.validationCode !== validationCode) {
      throw new Error('Code de validation incorrect');
    }

    return application;
  }

  /**
   * Notifie la completion d'une tâche par le client
   */
  private async notifyTaskCompletion(taskId: string, application: TaskApplicationModel): Promise<void> {
    // Récupérer la tâche pour obtenir le propriétaire
    const task = await TaskModel.query().findById(taskId);
    if (!task) throw new Error('Tâche non trouvée');

    // Notifier le prestataire que le client a marqué comme complété
    await TaskMessageService.sendSystemMessage(
      taskId,
      application.applicantId,
      'Le client a marqué votre travail comme complété. Veuillez valider avec le code de validation pour confirmer la réception.'
    );
  }

  /**
   * Valide une candidature complétée pour validation finale
   */
  private async validateCompletedApplication(taskId: string, validationCode: string): Promise<TaskApplicationModel> {
    const application = await this.findOne({
      status: ApplicationStatus.Completed,
      taskId,
    });

    if (!application) {
      throw new Error('Aucune candidature complétée trouvée');
    }

    if (application.validationCode !== validationCode) {
      throw new Error('Code de validation incorrect');
    }

    return application;
  }

  /**
   * Valide une candidature acceptée pour démarrage
   */
  private async validateAcceptedApplicationForStart(
    taskId: string,
    applicantId: string
  ): Promise<TaskApplicationModel> {
    const application = await this.findOne({
      applicantId,
      status: ApplicationStatus.Accepted,
      taskId,
    });

    if (!application) {
      throw new Error("Vous n'êtes pas autorisé à démarrer cette tâche");
    }

    return application;
  }

  /**
   * Valide une candidature démarrée pour completion par le CLIENT
   */
  private async validateStartedApplicationForClient(
    taskId: string,
    taskOwnerId: string
  ): Promise<TaskApplicationModel> {
    // Vérifier que c'est bien le propriétaire de la tâche
    const task = await TaskModel.query().findById(taskId);
    if (!task || task.userId !== taskOwnerId) {
      throw new Error('Seul le propriétaire de la tâche peut la marquer comme complétée');
    }

    // Trouver la candidature acceptée pour cette tâche
    const application = await this.findOne({
      status: ApplicationStatus.Accepted,
      taskId,
    });

    if (!application) {
      throw new Error('Aucune candidature acceptée trouvée pour cette tâche');
    }

    if (!application.startedAt) {
      throw new Error(
        "Le prestataire doit d'abord démarrer la tâche avant que vous puissiez la marquer comme complétée"
      );
    }

    return application;
  }

  /**
   * Valide une tâche pour validation finale par le PRESTATAIRE
   */
  private async validateTaskForValidationByApplicant(taskId: string, applicantId: string): Promise<TaskModel> {
    const task = await TaskModel.query().findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    // Vérifier que c'est bien le prestataire de cette tâche
    const application = await this.findOne({
      applicantId,
      status: ApplicationStatus.Completed,
      taskId,
    });

    if (!application) {
      throw new Error('Seul le prestataire de cette tâche peut la valider');
    }

    // Vérifier que la tâche est bien en statut COMPLETED
    if (task.status !== TaskStatus.Completed) {
      throw new Error("Cette tâche n'est pas encore complétée par le client");
    }

    return task;
  }
}

// Export d'une instance singleton
export default new TaskApplicationService();
