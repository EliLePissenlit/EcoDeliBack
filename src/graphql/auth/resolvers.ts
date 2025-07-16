import { ApolloError } from 'apollo-server-express';
import { combineResolvers } from 'graphql-resolvers';

import { ResolverContext } from '../../types/graphql/resolverContext';
import {
  Token,
  MutationLoginArgs,
  MutationRegisterArgs,
  MutationChangePasswordWhileLoggedInArgs,
  MutationResetPasswordAndSendItByEmailArgs,
  MutationUnsubscribeArgs,
} from '../../types/graphql/typeDefs';
import AuthWorkflow from '../../workflows/auth';
import isAuthenticated from '../shared/resolvers/isAuthenticated';

const Mutation = {
  changePasswordWhileLoggedIn: combineResolvers(
    isAuthenticated,
    async (
      parent,
      { input }: MutationChangePasswordWhileLoggedInArgs,
      { me }: ResolverContext
    ): Promise<Token | ApolloError> => AuthWorkflow.changePasswordWhileLoggedIn(input, me)
  ),
  login: combineResolvers(
    async (parent, { input }: MutationLoginArgs): Promise<Token | ApolloError> => AuthWorkflow.login(input)
  ),
  register: combineResolvers(
    async (parent, { input }: MutationRegisterArgs): Promise<boolean | ApolloError> => AuthWorkflow.register(input)
  ),
  resetPasswordAndSendItByEmail: combineResolvers(
    async (parent, { input }: MutationResetPasswordAndSendItByEmailArgs): Promise<boolean | ApolloError> =>
      AuthWorkflow.resetPasswordAndSendItByEmail(input)
  ),
  unsubscribe: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationUnsubscribeArgs, { me }: ResolverContext): Promise<boolean | ApolloError> =>
      AuthWorkflow.unsubscribe(input, me)
  ),
};

export default {
  Mutation,
};
