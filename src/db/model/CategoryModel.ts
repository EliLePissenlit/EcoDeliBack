import { Category, Maybe } from '../../types/graphql/typeDefs';
import Model from '..';

export class CategoryModel extends Model implements Category {
  __typename?: 'Category';

  createdAt!: string;

  color?: Maybe<string>;

  id!: string;

  fileId?: Maybe<string>;

  description?: Maybe<string>;

  amountInCents!: number;

  fileUrl?: Maybe<string>;

  name!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'categories';
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
