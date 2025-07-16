/* eslint-disable import/no-cycle */
import Model from '..';
import { TaskModel } from './TaskModel';
import { UserModel } from './UserModel';
import { MessageType } from '../../types/graphql/typeDefs';

export class TaskMessageModel extends Model {
  id!: string;

  taskId!: string;

  senderId!: string;

  receiverId!: string;

  content!: string;

  messageType!: MessageType;

  isRead!: boolean;

  createdAt!: string;

  // Relations
  task?: TaskModel;

  sender?: UserModel;

  receiver?: UserModel;

  static get tableName(): string {
    return 'task_messages';
  }

  static get relationMappings() {
    return {
      receiver: {
        join: {
          from: 'task_messages.receiver_id',
          to: 'users.id',
        },
        modelClass: UserModel,
        relation: Model.BelongsToOneRelation,
      },
      sender: {
        join: {
          from: 'task_messages.sender_id',
          to: 'users.id',
        },
        modelClass: UserModel,
        relation: Model.BelongsToOneRelation,
      },
      task: {
        join: {
          from: 'task_messages.task_id',
          to: 'tasks.id',
        },
        modelClass: TaskModel,
        relation: Model.BelongsToOneRelation,
      },
    };
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
  }
}
