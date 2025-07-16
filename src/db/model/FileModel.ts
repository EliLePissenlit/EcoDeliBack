import { File, FileType, Maybe } from '../../types/graphql/typeDefs';
import Model from '..';

export class FileModel extends Model implements File {
  __typename?: 'File';

  createdAt!: string;

  displayName!: string;

  downloadUrl?: Maybe<string>;

  fileName?: Maybe<string>;

  isFolder!: boolean;

  fileType!: FileType;

  id!: string;

  userId!: string;

  parentFolderId?: Maybe<string>;

  updatedAt!: string;

  static get tableName(): string {
    return 'files';
  }

  $beforeInsert() {
    this.createdAt = new Date().toISOString();
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}
