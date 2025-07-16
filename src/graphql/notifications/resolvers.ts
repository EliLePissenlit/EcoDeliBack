import { combineResolvers } from 'graphql-resolvers';
import pubsub, { withSafeFilter } from '../../infrastructure/server/pubsub';
import isAuthenticated from '../shared/resolvers/isAuthenticated';
import { ResolverContext } from '../../types/graphql/resolverContext';
import { Notification, ContactUsersInput } from '../../types/graphql/typeDefs';
import NotificationWorkflow from '../../workflows/notifications';
import isAdmin from '../shared/resolvers/isAdmin';

const Query = {
  getNotifications: combineResolvers(
    isAuthenticated,
    async (parent, args, { me }: ResolverContext): Promise<Notification[]> => NotificationWorkflow.getNotifications(me)
  ),
};

const Mutation = {
  contactUsers: combineResolvers(isAdmin, async (parent, { input }: { input: ContactUsersInput }) =>
    NotificationWorkflow.contactUsers(input)
  ),
  markAllNotificationsAsRead: combineResolvers(
    isAuthenticated,
    async (parent, args, { me }: ResolverContext): Promise<boolean> =>
      NotificationWorkflow.markAllNotificationsAsRead(me)
  ),
};

const Subscription = {
  onNewNotification: {
    subscribe: combineResolvers(
      isAuthenticated,
      withSafeFilter(
        () => pubsub.asyncIterator('newNotification'),
        (payload, variables, { me }: ResolverContext) => payload.userId === me.id
      )
    ),
  },
};

export default {
  Mutation,
  Query,
  Subscription,
};
