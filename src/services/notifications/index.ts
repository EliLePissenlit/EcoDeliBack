/* eslint-disable no-console */
import GenericService from '../@generic';
import { NotificationModel } from '../../db/model/NotificationModel';
import { Notification } from '../../types/graphql/typeDefs';
import pubsub from '../../infrastructure/server/pubsub';

class NotificationService extends GenericService<NotificationModel> {
  constructor() {
    super(NotificationModel);
  }

  public async save(input: any): Promise<NotificationModel> {
    console.log('NotificationService.save - Input reçu:', input);

    const notification = await super.save(input);
    console.log('NotificationService.save - Notification créée:', notification);

    try {
      await pubsub.publish('newNotification', {
        userId: notification.userId,
        ...notification,
      });
      console.log('NotificationService.save - Notification publiée via pubsub');
    } catch (error) {
      console.error('NotificationService.save - Erreur pubsub:', error);
    }

    return notification;
  }

  public async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await this.initializeQuery().where('userId', userId).orderBy('createdAt', 'desc');

    return notifications;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const unreadNotifications = await this.initializeQuery().where('userId', userId).where('isRead', false);

    if (unreadNotifications.length === 0) return false;

    await Promise.all(
      unreadNotifications.map((notification) =>
        this.save({
          id: notification.id,
          input: { isRead: true },
        })
      )
    );

    return true;
  }
}

export default new NotificationService();
