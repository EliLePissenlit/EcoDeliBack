/* eslint-disable no-param-reassign */
import Model from '..';
import { Notification, NotificationType } from '../../types/graphql/typeDefs';

export class NotificationModel extends Model implements Notification {
  id!: string;

  title!: string;

  type!: NotificationType;

  userId!: string;

  isRead!: boolean;

  createdAt!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'notifications';
  }

  $beforeInsert(): void {
    if (!this.id) {
      // Générer un ID si pas fourni
      this.id = `not_${Math.random().toString(36).substr(2, 9)}`;
    }
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
