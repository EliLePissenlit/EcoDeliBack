import { combineResolvers } from 'graphql-resolvers';

import { ResolverContext } from '../../types/graphql/resolverContext';
import FileWorkflow from '../../workflows/files';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import UserWorkflow from '../../workflows/users';
import isAdmin from '../shared/resolvers/isAdmin';

const Query = {
  listUsers: combineResolvers(isAdmin, async () => UserWorkflow.listUsers()),
  me: combineResolvers(isAuthenticated, async (parent, args, { me }: ResolverContext) => UserWorkflow.me(me.id)),
};

const Mutation = {
  saveLastPosition: combineResolvers(isAuthenticated, async (parent, { input }, { me }: ResolverContext) =>
    UserWorkflow.saveLastPosition({ input, me })
  ),
  suspendUser: combineResolvers(isAdmin, async (parent, { id }: { id: string }) => UserWorkflow.suspendUser({ id })),
  updateUser: combineResolvers(isAuthenticated, async (parent, { input }, { me }: ResolverContext) =>
    UserWorkflow.updateUser({ input, me })
  ),
};

const User = {
  avatar: combineResolvers(async (parent): Promise<string | null> => FileWorkflow.getAvatar(parent.id)),
};

export default {
  Mutation,
  Query,
  User,
};
