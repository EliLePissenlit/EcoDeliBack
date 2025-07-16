/* eslint-disable no-console */
/**
 * Workflow de gestion des tâches (annonces de services et livraisons)
 *
 * Ce workflow contient toute la logique métier pour :
 * - Création et validation des tâches
 * - Gestion des candidatures
 * - Completion et validation des tâches
 * - Messagerie entre participants
 *
 * Architecture : Méthodes statiques uniquement, délègue aux services
 */
import { ApolloError } from 'apollo-server-express';
import {
  TaskType,
  TaskStatus,
  MessageType,
  FileType,
  CreateTaskInput,
  AddressInput,
} from '../../types/graphql/typeDefs';
import TasksService from '../../services/tasks';
import TaskApplicationService from '../../services/task-applications';
import TaskMessageService from '../../services/task-messages';
import AddressService from '../../services/addresses';
import FileService from '../../services/files';
import { streamToBuffer } from '../../utils/upload';
import RelayPointService from '../../services/relay-points';

class TasksWorkflow {
  // =============================================================================
  // CRUD DES TÂCHES - Création, modification, suppression
  // =============================================================================

  public static async markAnIntermediaryStepForATask(
    taskId: string,
    intermediaryStep: AddressInput,
    userId: string,
    userLogger: any
  ): Promise<any> {
    try {
      const task = await TasksService.markAnIntermediaryStepForATask(taskId, intermediaryStep, userId);
      userLogger.info('Étape intermédiaire marquée avec succès', { intermediaryStep, taskId });
      return task;
    } catch (error) {
      userLogger.error("Erreur lors du marquage de l'étape intermédiaire", { error, intermediaryStep, taskId });
      throw error;
    }
  }

  /**
   * Crée une nouvelle tâche avec validation et calcul automatique du prix
   *
   * @param input - Données de la tâche à créer
   * @param userId - ID de l'utilisateur créateur
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche créée avec son prix calculé
   */
  public static async createTask(input: CreateTaskInput, userId: string, userLogger: any): Promise<any> {
    try {
      // Validation des données d'entrée
      this.validateCreateTaskInput(input);

      // Traitement de l'adresse principale
      const address = await AddressService.save({
        input: input.address,
      });

      // Traitement des adresses de livraison si nécessaire
      let pickupAddressId: string | null = null;
      let deliveryAddressId: string | null = null;

      if (input.type === TaskType.Shipping) {
        if (input.pickupAddress) {
          const pickupAddress = await AddressService.save({
            input: input.pickupAddress,
          });
          pickupAddressId = pickupAddress.id;
        }

        if (input.type === TaskType.Shipping && input.relayPointId) {
          // Vérifier que l'id correspond à un point relais
          const relayPoint = await RelayPointService.findById(input.relayPointId);
          if (!relayPoint) {
            throw new ApolloError(
              "L'adresse de destination doit être un point relais existant.",
              'DELIVERY_ADDRESS_NOT_RELAY_POINT'
            );
          }
          deliveryAddressId = relayPoint.addressId;
        }
      }

      // Traitement du fichier optionnel
      let fileId: string | null = null;
      if (input.file) {
        const { content, fileName } = await streamToBuffer(input.file);
        const user = { id: userId } as any; // Créer un objet user minimal
        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.TaskImage,
          user,
        });
        fileId = file.id;
      }

      // Préparation des données de la tâche
      const {
        // Exclure les champs spécifiques aux livraisons
        pickupAddress,
        deliveryAddress,
        relayPointId,
        packageCategory,
        packageDetails,
        // Garder les champs communs et spécifiques aux services
        ...taskFields
      } = input;

      const taskData = {
        ...taskFields,
        addressId: address.id,
        fileId,
        userId,
      };

      // Création de la tâche
      const task = await TasksService.createTask(taskData, {
        deliveryAddressId,
        packageCategory: input.packageCategory,
        packageDetails: input.packageDetails,
        pickupAddressId,
      });

      // Notification Slack pour les admins
      await this.notifyTaskCreation(task);

      userLogger.info('Tâche créée avec succès', { taskId: task.id, type: input.type });
      return task;
    } catch (error) {
      userLogger.error('Erreur lors de la création de la tâche', { error, input });
      throw error;
    }
  }

  /**
   * Met à jour une tâche existante
   *
   * @param id - ID de la tâche
   * @param input - Données de mise à jour
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche mise à jour
   */
  public static async updateTask(id: string, input: any, userId: string, userLogger: any): Promise<any> {
    try {
      // Validation des permissions
      await this.validateTaskOwnership(id, userId);

      // Traitement du fichier si fourni
      const updateData = { ...input };
      if (input.file) {
        const { content, fileName } = await streamToBuffer(input.file);
        const user = { id: userId } as any; // Créer un objet user minimal
        const file = await FileService.createAndUploadFile({
          content,
          displayName: fileName,
          fileType: FileType.TaskImage,
          user,
        });
        updateData.fileId = file.id;
      }

      // Traitement de l'adresse si fournie
      if (input.address) {
        const address = await AddressService.save({
          input: input.address,
        });
        updateData.addressId = address.id;
      }

      // Mise à jour de la tâche
      const updatedTask = await TasksService.save({ id, input: updateData });

      userLogger.info('Tâche mise à jour avec succès', { taskId: id });
      return updatedTask;
    } catch (error) {
      userLogger.error('Erreur lors de la mise à jour de la tâche', { error, taskId: id });
      throw error;
    }
  }

  /**
   * Supprime une tâche et toutes ses dépendances
   *
   * @param id - ID de la tâche
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns true si succès
   */
  public static async deleteTask(id: string, userId: string, userLogger: any): Promise<boolean> {
    try {
      // Validation des permissions
      await this.validateTaskOwnership(id, userId);

      // Suppression avec toutes les dépendances
      await TasksService.deleteTaskWithDependencies(id);

      userLogger.info('Tâche supprimée avec succès', { taskId: id });
      return true;
    } catch (error) {
      userLogger.error('Erreur lors de la suppression de la tâche', { error, taskId: id });
      throw error;
    }
  }

  // =============================================================================
  // VALIDATION ADMIN - Approuver/refuser les tâches
  // =============================================================================

  /**
   * Approuve une tâche en attente de validation
   *
   * @param id - ID de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche approuvée
   */
  public static async approveTask(id: string, userLogger: any): Promise<any> {
    try {
      // Validation du statut
      await this.validateTaskForApproval(id);

      // Approuver la tâche
      const approvedTask = await TasksService.updateTaskStatus(id, TaskStatus.Published);

      // Notification Slack
      await this.notifyTaskApproval(approvedTask);

      userLogger.info('Tâche approuvée avec succès', { taskId: id });
      return approvedTask;
    } catch (error) {
      userLogger.error("Erreur lors de l'approbation de la tâche", { error, taskId: id });
      throw error;
    }
  }

  /**
   * Refuse une tâche en attente de validation
   *
   * @param id - ID de la tâche
   * @param reason - Raison du refus
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche refusée
   */
  public static async rejectTask(id: string, reason: string, userLogger: any): Promise<any> {
    try {
      // Validation du statut
      await this.validateTaskForApproval(id);

      // Refuser la tâche
      const rejectedTask = await TasksService.updateTaskStatus(id, TaskStatus.Cancelled);

      // Notification Slack
      await this.notifyTaskRejection(rejectedTask, reason);

      userLogger.info('Tâche refusée avec succès', { reason, taskId: id });
      return rejectedTask;
    } catch (error) {
      userLogger.error('Erreur lors du refus de la tâche', { error, taskId: id });
      throw error;
    }
  }

  // =============================================================================
  // GESTION DES CANDIDATURES - Postulation, acceptation, refus
  // =============================================================================

  /**
   * Permet à un utilisateur de postuler à une tâche
   *
   * @param input - Données de la candidature
   * @param applicantId - ID du candidat
   * @param userLogger - Logger pour traçabilité
   * @returns La candidature créée
   */
  public static async applyToTask(input: any, applicantId: string, userLogger: any): Promise<any> {
    try {
      // Création de la candidature
      const application = await TaskApplicationService.applyToTask(input.taskId, applicantId, input.message);

      // Notification au propriétaire de la tâche
      await this.notifyNewApplication(application);

      userLogger.info('Candidature créée avec succès', {
        applicantId,
        taskId: input.taskId,
      });
      return application;
    } catch (error) {
      userLogger.error('Erreur lors de la création de la candidature', {
        applicantId,
        error,
        taskId: input.taskId,
      });
      throw error;
    }
  }

  /**
   * Accepte une candidature
   *
   * @param applicationId - ID de la candidature
   * @param taskOwnerId - ID du propriétaire de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La candidature acceptée
   */
  public static async acceptApplication(applicationId: string, taskOwnerId: string, userLogger: any): Promise<any> {
    try {
      const application = await TaskApplicationService.acceptApplication(applicationId, taskOwnerId, userLogger);

      userLogger.info('Candidature acceptée avec succès', {
        applicationId,
        taskId: application.taskId,
      });
      return application;
    } catch (error) {
      userLogger.error("Erreur lors de l'acceptation de la candidature", {
        applicationId,
        error,
      });
      throw error;
    }
  }

  /**
   * Refuse une candidature
   *
   * @param applicationId - ID de la candidature
   * @param reason - Raison du refus
   * @param taskOwnerId - ID du propriétaire de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La candidature refusée
   */
  public static async rejectApplication(
    applicationId: string,
    reason: string,
    taskOwnerId: string,
    userLogger: any
  ): Promise<any> {
    try {
      const application = await TaskApplicationService.rejectApplication(
        applicationId,
        reason,
        taskOwnerId,
        userLogger
      );

      userLogger.info('Candidature refusée avec succès', {
        applicationId,
        reason,
      });
      return application;
    } catch (error) {
      userLogger.error('Erreur lors du refus de la candidature', {
        applicationId,
        error,
      });
      throw error;
    }
  }

  // =============================================================================
  // COMPLETION ET VALIDATION - Fin de prestation
  // =============================================================================

  /**
   * Marque une tâche comme démarrée par le candidat
   *
   * @param taskId - ID de la tâche
   * @param applicantId - ID du candidat
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche démarrée
   */
  public static async startTask(taskId: string, applicantId: string, userLogger: any): Promise<any> {
    try {
      const task = await TaskApplicationService.startTask(taskId, applicantId);

      userLogger.info('Tâche démarrée avec succès', {
        applicantId,
        taskId,
      });
      return task;
    } catch (error) {
      userLogger.error('Erreur lors du démarrage de la tâche', {
        applicantId,
        error,
        taskId,
      });
      throw error;
    }
  }

  /**
   * Marque une tâche comme complétée par le CLIENT
   *
   * @param taskId - ID de la tâche
   * @param taskOwnerId - ID du propriétaire de la tâche (CLIENT)
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche complétée
   */
  public static async completeTask(taskId: string, taskOwnerId: string, userLogger: any): Promise<any> {
    try {
      const task = await TaskApplicationService.completeTask(taskId, taskOwnerId, userLogger);

      userLogger.info('Tâche marquée comme complétée par le client', {
        taskId,
        taskOwnerId,
      });
      return task;
    } catch (error) {
      userLogger.error('Erreur lors de la completion de la tâche par le client', {
        error,
        taskId,
        taskOwnerId,
      });
      throw error;
    }
  }

  /**
   * Valide la completion d'une tâche par le PRESTATAIRE
   *
   * @param taskId - ID de la tâche
   * @param validationCode - Code de validation
   * @param applicantId - ID du prestataire (candidat)
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche validée
   */
  public static async validateTaskCompletion(
    taskId: string,
    validationCode: string,
    applicantId: string,
    userLogger: any
  ): Promise<any> {
    try {
      const task = await TaskApplicationService.validateTaskCompletion(taskId, validationCode, applicantId, userLogger);

      userLogger.info('Tâche validée par le prestataire', {
        applicantId,
        taskId,
      });
      return task;
    } catch (error) {
      userLogger.error('Erreur lors de la validation de la tâche par le prestataire', {
        applicantId,
        error,
        taskId,
      });
      throw error;
    }
  }

  // =============================================================================
  // MESSAGERIE - Communication entre participants
  // =============================================================================

  /**
   * Envoie un message entre participants d'une tâche
   *
   * @param input - Données du message
   * @param senderId - ID de l'expéditeur
   * @param userLogger - Logger pour traçabilité
   * @returns Le message créé
   */
  public static async sendTaskMessage(input: any, senderId: string, userLogger: any): Promise<any> {
    try {
      const message = await TaskMessageService.sendMessage(
        input.taskId,
        senderId,
        input.receiverId,
        input.content,
        input.messageType || MessageType.Text
      );

      userLogger.info('Message envoyé avec succès', {
        receiverId: input.receiverId,
        senderId,
        taskId: input.taskId,
      });
      return message;
    } catch (error) {
      userLogger.error("Erreur lors de l'envoi du message", {
        error,
        taskId: input.taskId,
      });
      throw error;
    }
  }

  /**
   * Marque les messages comme lus
   *
   * @param taskId - ID de la tâche
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns true si succès
   */
  public static async markMessagesAsRead(taskId: string, userId: string, userLogger: any): Promise<boolean> {
    try {
      const result = await TaskMessageService.markMessagesAsRead(taskId, userId);

      userLogger.info('Messages marqués comme lus', {
        taskId,
        userId,
      });
      return result;
    } catch (error) {
      userLogger.error('Erreur lors du marquage des messages', {
        error,
        taskId,
        userId,
      });
      throw error;
    }
  }

  // =============================================================================
  // QUERIES - Récupération de données
  // =============================================================================

  /**
   * Récupère une tâche avec tous ses détails
   *
   * @param id - ID de la tâche
   * @param userLogger - Logger pour traçabilité
   * @returns La tâche avec ses relations
   */
  public static async getTask(id: string, userLogger: any): Promise<any> {
    try {
      const task = await TasksService.getTaskWithDetails(id);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      return task;
    } catch (error) {
      userLogger.error('Erreur lors de la récupération de la tâche', { error, taskId: id });
      throw error;
    }
  }

  /**
   * Liste les tâches avec filtres optionnels
   *
   * @param filters - Filtres à appliquer
   * @param userLogger - Logger pour traçabilité
   * @returns Liste des tâches filtrées
   */
  public static async listTasks(filters: any, userLogger: any): Promise<any[]> {
    try {
      // Par défaut, ne montrer que les tâches publiées
      const defaultFilters = { status: TaskStatus.Published, ...filters };
      return await TasksService.listTasksWithFilters(defaultFilters);
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des tâches', { error, filters });
      throw error;
    }
  }

  public static async listPendingTasks(userLogger: any): Promise<any[]> {
    try {
      const tasks = await TasksService.listTasksByStatus(TaskStatus.Draft);
      userLogger.info('Liste des tâches en attente récupérée', { count: tasks.length });
      return tasks;
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des tâches en attente', { error });
      throw error;
    }
  }

  public static async listTasksByStatus(status: TaskStatus, userLogger: any): Promise<any[]> {
    try {
      const tasks = await TasksService.listTasksByStatus(status);
      userLogger.info('Liste des tâches par statut récupérée', { count: tasks.length, status });
      return tasks;
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des tâches par statut', { error, status });
      throw error;
    }
  }

  /**
   * Récupère les tâches d'un utilisateur
   *
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns Liste des tâches de l'utilisateur
   */
  public static async getMyTasks(userId: string, userLogger: any): Promise<any[]> {
    try {
      return await TasksService.getMyTasks(userId);
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des tâches utilisateur', { error, userId });
      throw error;
    }
  }

  /**
   * Récupère les candidatures d'un utilisateur
   *
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns Liste des candidatures
   */
  public static async getMyApplications(userId: string, userLogger: any): Promise<any[]> {
    try {
      userLogger.info("Récupération des candidatures pour l'utilisateur", { userId });
      const applications = await TaskApplicationService.getMyApplications(userId);
      userLogger.info('Candidatures récupérées avec succès', {
        applications: applications.map((app) => ({
          id: app.id,
          status: app.status,
          taskId: app.taskId,
        })),
        count: applications.length,
        userId,
      });
      return applications;
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des candidatures', { error, userId });
      throw error;
    }
  }

  /**
   * Récupère les candidatures d'une tâche
   *
   * @param taskId - ID de la tâche
   * @param taskOwnerId - ID du propriétaire
   * @param userLogger - Logger pour traçabilité
   * @returns Liste des candidatures
   */
  public static async getTaskApplications(taskId: string, taskOwnerId: string, userLogger: any): Promise<any[]> {
    try {
      // Validation des permissions
      await this.validateTaskOwnership(taskId, taskOwnerId);
      return await TaskApplicationService.getTaskApplications(taskId);
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des candidatures', { error, taskId });
      throw error;
    }
  }

  /**
   * Récupère les messages d'une tâche
   *
   * @param taskId - ID de la tâche
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns Liste des messages
   */
  public static async getTaskMessages(taskId: string, userId: string, userLogger: any): Promise<any[]> {
    try {
      return await TaskMessageService.getTaskMessages(taskId, userId);
    } catch (error) {
      userLogger.error('Erreur lors de la récupération des messages', { error, taskId });
      throw error;
    }
  }

  /**
   * Compte les messages non lus d'un utilisateur
   *
   * @param userId - ID de l'utilisateur
   * @param userLogger - Logger pour traçabilité
   * @returns Nombre de messages non lus
   */
  public static async getUnreadMessagesCount(userId: string, userLogger: any): Promise<number> {
    try {
      return await TaskMessageService.getUnreadMessagesCount(userId);
    } catch (error) {
      userLogger.error('Erreur lors du comptage des messages non lus', { error, userId });
      throw error;
    }
  }

  // =============================================================================
  // MÉTHODES PRIVÉES - Validation et logique métier
  // =============================================================================

  /**
   * Valide les données d'entrée pour la création d'une tâche
   */
  private static validateCreateTaskInput(input: any): void {
    if (!input.type) {
      throw new Error('Le type de tâche est obligatoire');
    }

    if (!input.title || !input.description) {
      throw new Error('Le titre et la description sont obligatoires');
    }

    if (!input.address) {
      throw new Error("L'adresse est obligatoire");
    }

    // Validation spécifique selon le type
    if (input.type === TaskType.Service) {
      if (!input.categoryId) {
        throw new Error('La catégorie est obligatoire pour les services');
      }
      if (!input.estimatedDuration) {
        throw new Error('La durée estimée est obligatoire pour les services');
      }
    }

    if (input.type === TaskType.Shipping) {
      if (!input.packageCategory) {
        throw new Error('La catégorie de colis est obligatoire pour les livraisons');
      }
      if (!input.pickupAddress || !input.relayPointId) {
        throw new Error('Les adresses de départ et de point relais sont obligatoires pour les livraisons');
      }
      // La catégorie est optionnelle pour les livraisons mais peut être fournie
    }
  }

  /**
   * Calcule le prix d'une tâche selon son type
   */
  public static async calculateTaskPrice(task: any): Promise<number> {
    if (task.type === TaskType.Service) {
      return await TasksService.calculateServicePrice(task.id);
    }
    if (task.type === TaskType.Shipping) {
      if (!task.shipping) {
        return 0;
      }
      return await TasksService.calculateShippingPrice(
        task.shipping.pickupAddressId,
        task.shipping.deliveryAddressId,
        task.shipping.packageCategory
      );
    }
    return 0;
  }

  /**
   * Valide qu'un utilisateur est propriétaire d'une tâche
   */
  private static async validateTaskOwnership(taskId: string, userId: string): Promise<any> {
    const task = await TasksService.findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }
    if (task.userId !== userId) {
      throw new Error("Vous n'êtes pas autorisé à modifier cette tâche");
    }
    return task;
  }

  /**
   * Valide qu'une tâche peut être approuvée/refusée
   */
  private static async validateTaskForApproval(taskId: string): Promise<any> {
    const task = await TasksService.findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }
    if (task.status !== TaskStatus.Draft) {
      throw new Error('Seules les tâches en brouillon peuvent être approuvées/refusées');
    }
    return task;
  }

  // =============================================================================
  // NOTIFICATIONS - Envoi de notifications Slack
  // =============================================================================

  /**
   * Notifie la création d'une nouvelle tâche
   */
  private static async notifyTaskCreation(task: any): Promise<void> {
    // TODO: Implémenter la notification Slack

    console.log(`Nouvelle tâche créée : ${task.title} (${task.type})`);
  }

  /**
   * Notifie l'approbation d'une tâche
   */
  private static async notifyTaskApproval(task: any): Promise<void> {
    // TODO: Implémenter la notification Slack
    console.log(`Tâche approuvée : ${task.title} (ID: ${task.id})`);
  }

  /**
   * Notifie le refus d'une tâche
   */
  private static async notifyTaskRejection(task: any, reason: string): Promise<void> {
    // TODO: Implémenter la notification Slack
    console.log(`Tâche refusée : ${task.title} (ID: ${task.id}) - Raison : ${reason}`);
  }

  /**
   * Notifie une nouvelle candidature
   */
  private static async notifyNewApplication(application: any): Promise<void> {
    // TODO: Implémenter la notification Slack
    console.log(`Nouvelle candidature reçue pour la tâche ${application.taskId}`);
  }
}

export default TasksWorkflow;
