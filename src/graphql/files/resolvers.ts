import { combineResolvers } from 'graphql-resolvers';

import { ResolverContext } from '../../types/graphql/resolverContext';
import {
  MutationCreateFilesArgs,
  MutationCreateFolderArgs,
  MutationDeleteFileArgs,
  MutationUploadAvatarArgs,
  QueryGetFileByIdArgs,
  QueryListFilesInFolderArgs,
} from '../../types/graphql/typeDefs';
import FileWorkflow from '../../workflows/files';
import isAuthenticated from '../shared/resolvers/isAuthenticated';

const Mutation = {
  createFiles: combineResolvers(
    isAuthenticated,
    async (parent, { files, parentFolderId }: MutationCreateFilesArgs, { me }: ResolverContext) =>
      FileWorkflow.createFiles({ files, me, parentFolderId })
  ),
  createFolder: combineResolvers(
    isAuthenticated,
    async (parent, { name, parentFolderId }: MutationCreateFolderArgs, { me }: ResolverContext) =>
      FileWorkflow.createFolder({ me, name, parentFolderId })
  ),
  deleteFile: combineResolvers(isAuthenticated, async (parent, { id }: MutationDeleteFileArgs) =>
    FileWorkflow.deleteFile(id)
  ),
  uploadAvatar: combineResolvers(
    isAuthenticated,
    async (parent, { file }: MutationUploadAvatarArgs, { me }: ResolverContext) =>
      FileWorkflow.uploadAvatar({ file, me })
  ),
};

const Query = {
  getFileById: combineResolvers(isAuthenticated, async (parent, { id }: QueryGetFileByIdArgs) =>
    FileWorkflow.getFileById(id)
  ),
  listFiles: combineResolvers(isAuthenticated, async (parent, args, { me }: ResolverContext) =>
    FileWorkflow.listFiles(me)
  ),
  listFilesInFolder: combineResolvers(
    isAuthenticated,
    async (parent, { folderId }: QueryListFilesInFolderArgs, { me }: ResolverContext) =>
      FileWorkflow.listFilesInFolder({ folderId, me })
  ),
};

const File = {
  downloadUrl: ({ id }) => FileWorkflow.getDownloadUrl(id),
};

export default {
  File,
  Mutation,
  Query,
};
