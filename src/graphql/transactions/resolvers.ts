import { combineResolvers } from 'graphql-resolvers';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import TransactionWorkflow from '../../workflows/transactions/index';
import { ResolverContext } from '../../types/graphql/resolverContext';
import {
  QueryGetTransactionArgs,
  MutationCreateCustomPaymentArgs,
  MutationCreateSubscriptionArgs,
  MutationCancelSubscriptionArgs,
} from '../../types/graphql/typeDefs';
import StripeService from '../../external-services/stripe';

const Mutation = {
  cancelSubscription: combineResolvers(isAuthenticated, async (parent, { input }: MutationCancelSubscriptionArgs) =>
    TransactionWorkflow.cancelSubscriptionByEmail(input)
  ),
  createCustomPayment: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationCreateCustomPaymentArgs, { me }: ResolverContext) =>
      TransactionWorkflow.createCustomPayment(input, me)
  ),
  createSubscription: combineResolvers(
    isAuthenticated,
    async (parent, { input }: MutationCreateSubscriptionArgs, { me }: ResolverContext) =>
      TransactionWorkflow.createSubscription(input, me)
  ),
};

const Query = {
  getActiveSubscriptions: combineResolvers(async (parent, args, { me }: ResolverContext) =>
    TransactionWorkflow.getActiveSubscriptions(me.id)
  ),
  getTransaction: combineResolvers(isAuthenticated, async (parent, { id }: QueryGetTransactionArgs) =>
    TransactionWorkflow.getTransaction(id)
  ),
  getUserTransactions: combineResolvers(isAuthenticated, async (parent, args, { me }: ResolverContext) =>
    TransactionWorkflow.getUserTransactions(me.id)
  ),
};

const Transaction = {
  relatedInvoice: combineResolvers(isAuthenticated, async (parent) => {
    if (parent.isSubscription) {
      return StripeService.getInvoice(parent.stripeInvoiceId);
    }
    return StripeService.getReceipt(parent.stripeIntentId);
  }),
};

export default {
  Mutation,
  Query,
  Transaction,
};
