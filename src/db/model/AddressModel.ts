import { Address } from '../../types/graphql/typeDefs';
import Model from '..';

export class AddressModel extends Model implements Address {
  __typename?: 'Address';

  createdAt!: string;

  fullAddress!: string;

  id!: string;

  lat!: number;

  lng!: number;

  locationType!: string;

  mainText!: string;

  placeId!: string;

  secondaryText!: string;

  updatedAt!: string;

  // Propriété géométrique PostGIS (non exposée via GraphQL)
  geom?: any;

  static get tableName() {
    return 'addresses';
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }

  // Méthode pour mettre à jour la géométrie lors de l'insertion/modification
  $beforeSave() {
    if (this.lat && this.lng) {
      this.geom = AddressModel.raw(`ST_SetSRID(ST_MakePoint(${this.lng}, ${this.lat}), 4326)`);
    }
  }
}
