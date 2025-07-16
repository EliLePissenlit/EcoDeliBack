/* eslint-disable import/no-cycle */
import Model from '..';
import { TaskModel } from './TaskModel';
import { UserModel } from './UserModel';
import { ApplicationStatus } from '../../types/graphql/typeDefs';

export class TaskApplicationModel extends Model {
  id!: string;

  taskId!: string;

  applicantId!: string;

  status!: ApplicationStatus;

  message!: string;

  validationCode?: string | null;

  startedAt?: string | null;

  completedAt?: string | null;

  validatedAt?: string | null;

  createdAt!: string;

  updatedAt!: string;

  // Relations
  task?: TaskModel;

  applicant?: UserModel;

  static get tableName(): string {
    return 'task_applications';
  }

  static get relationMappings() {
    return {
      applicant: {
        join: {
          from: 'task_applications.applicant_id',
          to: 'users.id',
        },
        modelClass: UserModel,
        relation: Model.BelongsToOneRelation,
      },
      task: {
        join: {
          from: 'task_applications.task_id',
          to: 'tasks.id',
        },
        modelClass: TaskModel,
        relation: Model.BelongsToOneRelation,
      },
    };
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
