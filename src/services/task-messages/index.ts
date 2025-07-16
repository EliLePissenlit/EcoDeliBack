/**
 * Service de gestion des messages entre participants d'une tâche
 *
 * Ce service gère :
 * - Envoi de messages entre propriétaire et candidats
 * - Messages système automatiques
 * - Codes de validation
 * - Gestion des permissions d'accès
 * - Marquage des messages comme lus
 *
 * Architecture : Hérite de GenericService pour les opérations CRUD de base
 */
import { TaskMessageModel } from '../../db/model/TaskMessageModel';
import { TaskModel } from '../../db/model/TaskModel';
import { TaskApplicationModel } from '../../db/model/TaskApplicationModel';
import { MessageType } from '../../types/graphql/typeDefs';
import GenericService from '../@generic';
import TaskNotificationService from '../notifications/task-notifications';

class TaskMessageService extends GenericService<TaskMessageModel> {
  constructor() {
    super(TaskMessageModel);
  }

  /**
   * Envoie un message entre participants d'une tâche
   *
   * @param taskId - ID de la tâche
   * @param senderId - ID de l'expéditeur
   * @param receiverId - ID du destinataire
   * @param content - Contenu du message
   * @param messageType - Type de message (défaut: TEXT)
   * @returns Le message créé
   */
  public async sendMessage(
    taskId: string,
    senderId: string,
    receiverId: string,
    content: string,
    messageType: MessageType = MessageType.Text
  ): Promise<TaskMessageModel> {
    // Validation des permissions
    await this.validateMessagePermissions(taskId, senderId, receiverId);

    // Créer une notification pour le destinataire
    await TaskNotificationService.notifyTaskMessageReceived(receiverId, taskId, content);

    // Création du message
    return await this.save({
      input: {
        content,
        isRead: false,
        messageType,
        receiverId,
        senderId,
        taskId,
      },
    });
  }

  /**
   * Récupère tous les messages d'une tâche
   *
   * @param taskId - ID de la tâche
   * @param userId - ID de l'utilisateur demandant les messages
   * @returns Liste des messages avec détails des utilisateurs
   */
  public async getTaskMessages(taskId: string, userId: string): Promise<TaskMessageModel[]> {
    // Validation des permissions d'accès
    await this.validateMessageAccess(taskId, userId);

    return await TaskMessageModel.query()
      .where('task_id', taskId)
      .withGraphFetched('[sender, receiver]')
      .orderBy('created_at', 'asc');
  }

  /**
   * Marque tous les messages reçus par un utilisateur comme lus
   *
   * @param taskId - ID de la tâche
   * @param userId - ID de l'utilisateur
   * @returns true si succès
   */
  public async markMessagesAsRead(taskId: string, userId: string): Promise<boolean> {
    // Validation des permissions d'accès
    await this.validateMessageAccess(taskId, userId);

    // Marquer tous les messages non lus comme lus
    await TaskMessageModel.query()
      .where('task_id', taskId)
      .where('receiver_id', userId)
      .where('is_read', false)
      .patch({ isRead: true });

    return true;
  }

  /**
   * Compte les messages non lus d'un utilisateur
   *
   * @param userId - ID de l'utilisateur
   * @returns Nombre de messages non lus
   */
  public async getUnreadMessagesCount(userId: string): Promise<number> {
    const messages = await TaskMessageModel.query().where('receiver_id', userId).where('is_read', false);

    return messages.length;
  }

  /**
   * Envoie un message système automatique
   *
   * @param taskId - ID de la tâche
   * @param receiverId - ID du destinataire
   * @param content - Contenu du message
   * @returns Le message système créé
   */
  public async sendSystemMessage(taskId: string, receiverId: string, content: string): Promise<TaskMessageModel> {
    return await this.save({
      input: {
        content,
        isRead: false,
        messageType: MessageType.System,

        // Utiliser le destinataire comme expéditeur pour les messages système
        receiverId,

        senderId: receiverId,

        taskId,
      },
    });
  }
  // =============================================================================
  // MÉTHODES PRIVÉES - Validation et logique métier
  // =============================================================================

  /**
   * Valide les permissions pour envoyer un message
   */
  private async validateMessagePermissions(taskId: string, senderId: string, receiverId: string): Promise<void> {
    const task = await TaskModel.query().findById(taskId);
    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    // Vérifier que l'expéditeur est autorisé
    if (!(await this.isUserAuthorizedForTask(taskId, senderId))) {
      throw new Error("Vous n'êtes pas autorisé à envoyer des messages pour cette tâche");
    }

    // Vérifier que le destinataire est autorisé
    if (!(await this.isUserAuthorizedForTask(taskId, receiverId))) {
      throw new Error('Destinataire invalide');
    }
  }

  /**
   * Valide l'accès aux messages d'une tâche
   */
  private async validateMessageAccess(taskId: string, userId: string): Promise<void> {
    if (!(await this.isUserAuthorizedForTask(taskId, userId))) {
      throw new Error("Vous n'êtes pas autorisé à voir les messages de cette tâche");
    }
  }

  /**
   * Vérifie si un utilisateur est autorisé pour une tâche
   * (propriétaire ou candidat)
   */
  private async isUserAuthorizedForTask(taskId: string, userId: string): Promise<boolean> {
    // Vérifier si c'est le propriétaire
    const task = await TaskModel.query().findById(taskId);
    if (task?.userId === userId) {
      return true;
    }

    // Vérifier si c'est un candidat
    const application = await TaskApplicationModel.query()
      .where('task_id', taskId)
      .where('applicant_id', userId)
      .first();

    return !!application;
  }
}

// Export d'une instance singleton
export default new TaskMessageService();
