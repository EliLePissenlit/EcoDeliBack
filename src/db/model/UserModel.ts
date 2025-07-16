/* eslint-disable no-param-reassign */
import Model from '..';
import { Role, User } from '../../types/graphql/typeDefs';

export class UserModel extends Model implements User {
  id!: string;

  email!: string;

  stripeCustomerId?: string | null;

  role!: Role;

  password?: string | null;

  firstName?: string | null;

  lastName?: string | null;

  phone?: string | null;

  passwordUpdatedAt!: string;

  isUserEmailVerified!: boolean;

  isSuspended!: boolean;

  lastAddressId?: string | null;

  isUnderSurveillance!: boolean;

  lastLoginAt!: string;

  createdAt!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'users';
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    this.lastLoginAt = new Date().toISOString();
    this.passwordUpdatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
