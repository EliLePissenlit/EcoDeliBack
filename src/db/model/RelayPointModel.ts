import Model from '..';

import { AddressModel } from './AddressModel';

export interface OpeningDay {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

export class RelayPointModel extends Model {
  id!: string;

  userId!: string;

  fileId?: string | null;

  name!: string;

  description!: string;

  addressId?: string | null;

  openingDays!: OpeningDay[];

  createdAt!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'relay_points';
  }

  static relationMappings = {
    address: {
      join: {
        from: 'relay_points.addressId',
        to: 'addresses.id',
      },
      modelClass: AddressModel,
      relation: Model.HasOneRelation,
    },
  };

  static get jsonAttributes(): string[] {
    return ['openingDays'];
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
