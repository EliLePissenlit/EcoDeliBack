import { NotificationType } from '../../types/graphql/typeDefs';
import NotificationService from './index';

class TaskNotificationService {
  /**
   * Crée une notification pour une nouvelle candidature reçue
   */
  public static async notifyTaskApplicationReceived(
    taskOwnerId: string,
    taskTitle: string,
    applicantName: string,
    userLogger: any
  ): Promise<void> {
    try {
      userLogger.info('Tentative de création de notification de candidature', {
        applicantName,
        taskOwnerId,
        taskTitle,
        type: NotificationType.TaskApplicationReceived,
      });

      const notification = await NotificationService.save({
        input: {
          title: `Nouvelle candidature pour "${taskTitle}"`,
          type: NotificationType.TaskApplicationReceived,
          userId: taskOwnerId,
        },
      });

      userLogger.info('Notification de candidature créée avec succès', {
        notification,
        notificationId: notification.id,
        taskOwnerId,
        taskTitle,
      });
    } catch (error) {
      userLogger.error('Erreur lors de la création de la notification de candidature', {
        error,
        stack: error.stack,
        taskOwnerId,
        taskTitle,
      });
    }
  }

  public static async notifyTaskMessageReceived(receiverId: string, taskId: string, content: string): Promise<void> {
    await NotificationService.save({
      input: {
        title: `Nouveau message pour la tâche "${taskId} - ${content}"`,
        type: NotificationType.Message,
        userId: receiverId,
      },
    });
  }

  /**
   * Crée une notification pour une candidature acceptée
   */
  public static async notifyTaskApplicationAccepted(
    applicantId: string,
    taskTitle: string,
    userLogger: any
  ): Promise<void> {
    try {
      userLogger.info("Tentative de création de notification d'acceptation", {
        applicantId,
        taskTitle,
        type: NotificationType.TaskApplicationAccepted,
      });

      const notification = await NotificationService.save({
        input: {
          title: `Votre candidature pour "${taskTitle}" a été acceptée !`,
          type: NotificationType.TaskApplicationAccepted,
          userId: applicantId,
        },
      });

      userLogger.info("Notification d'acceptation créée avec succès", {
        applicantId,
        notification,
        notificationId: notification.id,
        taskTitle,
      });
    } catch (error) {
      userLogger.error("Erreur lors de la création de la notification d'acceptation", {
        applicantId,
        error,
        stack: error.stack,
        taskTitle,
      });
    }
  }

  /**
   * Crée une notification pour une candidature rejetée
   */
  public static async notifyTaskApplicationRejected(
    applicantId: string,
    taskTitle: string,
    reason: string,
    userLogger: any
  ): Promise<void> {
    try {
      userLogger.info('Tentative de création de notification de rejet', {
        applicantId,
        reason,
        taskTitle,
        type: NotificationType.TaskApplicationRejected,
      });

      const notification = await NotificationService.save({
        input: {
          title: `Votre candidature pour "${taskTitle}" a été rejetée`,
          type: NotificationType.TaskApplicationRejected,
          userId: applicantId,
        },
      });

      userLogger.info('Notification de rejet créée avec succès', {
        applicantId,
        notification,
        notificationId: notification.id,
        reason,
        taskTitle,
      });
    } catch (error) {
      userLogger.error('Erreur lors de la création de la notification de rejet', {
        applicantId,
        error,
        reason,
        stack: error.stack,
        taskTitle,
      });
    }
  }

  /**
   * Crée une notification pour une tâche terminée (envoyée au prestataire)
   */
  public static async notifyTaskCompleted(
    applicantId: string,
    taskTitle: string,
    validationCode: string,
    userLogger: any
  ): Promise<void> {
    try {
      userLogger.info('Tentative de création de notification de completion', {
        applicantId,
        taskTitle,
        type: NotificationType.TaskCompleted,
        validationCode,
      });

      const notification = await NotificationService.save({
        input: {
          title: `La tâche "${taskTitle}" a été terminée par le client. Code de validation : ${validationCode}`,
          type: NotificationType.TaskCompleted,
          userId: applicantId,
        },
      });

      userLogger.info('Notification de completion créée avec succès', {
        applicantId,
        notification,
        notificationId: notification.id,
        taskTitle,
        validationCode,
      });
    } catch (error) {
      userLogger.error('Erreur lors de la création de la notification de completion', {
        applicantId,
        error,
        stack: error.stack,
        taskTitle,
        validationCode,
      });
    }
  }

  /**
   * Crée une notification pour une tâche validée (envoyée au client)
   */
  public static async notifyTaskValidated(taskOwnerId: string, taskTitle: string, userLogger: any): Promise<void> {
    try {
      userLogger.info('Tentative de création de notification de validation', {
        taskOwnerId,
        taskTitle,
        type: NotificationType.TaskValidated,
      });

      const notification = await NotificationService.save({
        input: {
          title: `La tâche "${taskTitle}" a été validée par le prestataire`,
          type: NotificationType.TaskValidated,
          userId: taskOwnerId,
        },
      });

      userLogger.info('Notification de validation créée avec succès', {
        notification,
        notificationId: notification.id,
        taskOwnerId,
        taskTitle,
      });
    } catch (error) {
      userLogger.error('Erreur lors de la création de la notification de validation', {
        error,
        stack: error.stack,
        taskOwnerId,
        taskTitle,
      });
    }
  }

  /**
   * Crée une notification pour un changement de statut de tâche
   */
  public static async notifyTaskStatusChanged(
    taskOwnerId: string,
    taskTitle: string,
    newStatus: string,
    userLogger: any
  ): Promise<void> {
    try {
      userLogger.info('Tentative de création de notification de changement de statut', {
        newStatus,
        taskOwnerId,
        taskTitle,
        type: NotificationType.TaskStatusChanged,
      });

      const notification = await NotificationService.save({
        input: {
          title: `Le statut de "${taskTitle}" a changé : ${newStatus}`,
          type: NotificationType.TaskStatusChanged,
          userId: taskOwnerId,
        },
      });

      userLogger.info('Notification de changement de statut créée avec succès', {
        newStatus,
        notification,
        notificationId: notification.id,
        taskOwnerId,
        taskTitle,
      });
    } catch (error) {
      userLogger.error('Erreur lors de la création de la notification de changement de statut', {
        error,
        newStatus,
        stack: error.stack,
        taskOwnerId,
        taskTitle,
      });
    }
  }
}

export default TaskNotificationService;
