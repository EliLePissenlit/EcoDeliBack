import { combineResolvers } from 'graphql-resolvers';
import { Category, CreateCategoryInput, UpdateCategoryInput } from '../../types/graphql/typeDefs';
import { ResolverContext } from '../../types/graphql/resolverContext';
import CategoryWorkflow from '../../workflows/categories';
import FileService from '../../services/files';
import isAdmin from '../shared/resolvers/isAdmin';
import isAuthenticated from '../shared/resolvers/isAuthenticated';

const Query = {
  getCategories: combineResolvers(isAuthenticated, async (): Promise<Category[]> => CategoryWorkflow.getCategories()),
  getCategory: combineResolvers(
    isAuthenticated,
    async (parent, args): Promise<Category> => CategoryWorkflow.getCategory(args.id)
  ),
};

const Mutation = {
  createCategory: combineResolvers(
    isAdmin,
    async (parent, { input }: { input: CreateCategoryInput }, { me }: ResolverContext) =>
      CategoryWorkflow.createCategory(input, me)
  ),
  deleteCategory: combineResolvers(isAdmin, async (parent, { id }: { id: string }) =>
    CategoryWorkflow.deleteCategory(id)
  ),
  updateCategory: combineResolvers(
    isAdmin,
    async (parent, { id, input }: { id: string; input: UpdateCategoryInput }, { me }: ResolverContext) =>
      CategoryWorkflow.updateCategory(id, input, me)
  ),
};

const CategoryResolver = {
  fileUrl: async (parent: Category) => {
    if (!parent.fileId) return null;
    const file = await FileService.findById(parent.fileId);
    return FileService.createDownloadUrl(file, true);
  },
};

export default {
  Category: CategoryResolver,
  Mutation,
  Query,
};
