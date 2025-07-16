/* eslint-disable import/no-cycle */
import Model from '..';
import { TaskModel } from './TaskModel';
import { AddressModel } from './AddressModel';
import { PackageCategory } from '../../types/graphql/typeDefs';

export class ShippingModel extends Model {
  id!: string;

  taskId!: string;

  packageCategory!: PackageCategory;

  pickupAddressId!: string;

  deliveryAddressId!: string;

  packageDetails?: any | null;

  estimatedDistanceInMeters?: number | null;

  estimatedDurationInMinutes?: number | null;

  calculatedPriceInCents?: number | null;

  createdAt!: string;

  updatedAt!: string;

  // Relations
  task?: TaskModel;

  pickupAddress?: AddressModel;

  deliveryAddress?: AddressModel;

  static get tableName(): string {
    return 'shippings';
  }

  static get relationMappings() {
    return {
      deliveryAddress: {
        join: {
          from: 'shippings.delivery_address_id',
          to: 'addresses.id',
        },
        modelClass: AddressModel,
        relation: Model.BelongsToOneRelation,
      },
      pickupAddress: {
        join: {
          from: 'shippings.pickup_address_id',
          to: 'addresses.id',
        },
        modelClass: AddressModel,
        relation: Model.BelongsToOneRelation,
      },
      task: {
        join: {
          from: 'shippings.task_id',
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
