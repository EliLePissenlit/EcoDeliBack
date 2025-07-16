/* eslint-disable import/no-cycle */
import Model from '..';
import { UserModel } from './UserModel';
import { CategoryModel } from './CategoryModel';
import { FileModel } from './FileModel';
import { AddressModel } from './AddressModel';
import { TaskApplicationModel } from './TaskApplicationModel';
import { TaskMessageModel } from './TaskMessageModel';
import { ShippingModel } from './ShippingModel';
import { TaskType, TaskStatus } from '../../types/graphql/typeDefs';

export class TaskModel extends Model {
  id!: string;

  userId!: string;

  categoryId?: string | null;

  type!: TaskType;

  status!: TaskStatus;

  title!: string;

  description!: string;

  estimatedDuration?: number | null;

  fileId?: string | null;

  addressId!: string;

  calculatedPriceInCents?: number | null;

  createdAt!: string;

  updatedAt!: string;

  // Relations
  user?: UserModel;

  category?: CategoryModel;

  file?: FileModel;

  address?: AddressModel;

  applications?: TaskApplicationModel[];

  messages?: TaskMessageModel[];

  shipping?: ShippingModel;

  static get tableName(): string {
    return 'tasks';
  }

  static get relationMappings() {
    return {
      address: {
        join: {
          from: 'tasks.address_id',
          to: 'addresses.id',
        },
        modelClass: AddressModel,
        relation: Model.BelongsToOneRelation,
      },
      applications: {
        join: {
          from: 'tasks.id',
          to: 'task_applications.task_id',
        },
        modelClass: TaskApplicationModel,
        relation: Model.HasManyRelation,
      },
      category: {
        join: {
          from: 'tasks.category_id',
          to: 'categories.id',
        },
        modelClass: CategoryModel,
        relation: Model.BelongsToOneRelation,
      },
      file: {
        join: {
          from: 'tasks.file_id',
          to: 'files.id',
        },
        modelClass: FileModel,
        relation: Model.BelongsToOneRelation,
      },
      messages: {
        join: {
          from: 'tasks.id',
          to: 'task_messages.task_id',
        },
        modelClass: TaskMessageModel,
        relation: Model.HasManyRelation,
      },
      shipping: {
        join: {
          from: 'tasks.id',
          to: 'shippings.task_id',
        },
        modelClass: ShippingModel,
        relation: Model.HasOneRelation,
      },
      user: {
        join: {
          from: 'tasks.user_id',
          to: 'users.id',
        },
        modelClass: UserModel,
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
