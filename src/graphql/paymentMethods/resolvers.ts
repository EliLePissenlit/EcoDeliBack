import { combineResolvers } from 'graphql-resolvers';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import { ResolverContext } from '../../types/graphql/resolverContext';
import PaymentMethodWorkflow from '../../workflows/paymentMethods';

const Query = {
  getUserPaymentMethods: combineResolvers(isAuthenticated, async (parent, args, { me }: ResolverContext) =>
    PaymentMethodWorkflow.getUserPaymentMethods(me)
  ),
};

const Mutation = {
  deletePaymentMethod: combineResolvers(
    isAuthenticated,
    async (parent, args, { me }: ResolverContext): Promise<boolean> =>
      PaymentMethodWorkflow.deletePaymentMethod(args.paymentMethodId, me)
  ),
};

export default {
  Mutation,
  Query,
};
