import { ApolloError } from 'apollo-server-express';
import { execute } from 'graphql/execution';
import { subscribe } from 'graphql/subscription';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import schema from '../../../graphql';
import logger from '../../logger';
import { formatError, logApolloError, logError, logErrors } from '../errorsHandlers';
import getContext from '../getContext';

const createSubscriptionServer = async ({ apolloServer, httpServer }) => {
  const subscriptionServer = SubscriptionServer.create(
    {
      execute,
      async onConnect(connectionParams, webSocket) {
        try {
          const { httpCookie, ipAddress, platform, requestId } = webSocket.upgradeReq.headers;
          return await getContext({
            httpCookie,
            ipAddress,
            platform,
            requestId,
            token: connectionParams.token,
          });
        } catch (error) {
          if (!(error instanceof ApolloError)) {
            logger.error('[SUBSCRIPTIONS] error during context creation', {
              error,
              errorStack: error.stack || error.extensions?.exception?.stacktrace,
            });
          } else {
            logApolloError({
              ApolloEr: error,
              logObject: error,
              logger,
              source: 'SUBSCRIPTIONS',
            });
          }
          throw error;
        }
      },
      onOperation(message, params) {
        const logErrorParams = {
          additionalInfo: {
            operationName: message.payload.operationName,
            platform: params.context.platform,
            variables: message.payload.variables,
          },
          logger: params.context.logger,
          source: 'SUBSCRIPTIONS',
        };
        // eslint-disable-next-line no-param-reassign
        params.formatResponse = (response) => {
          if (response.errors) {
            logErrors({
              ...logErrorParams,
              errors: response.errors,
            });
          }
          return response;
        };
        // eslint-disable-next-line no-param-reassign
        params.formatError = (error) => {
          logError({
            ...logErrorParams,
            error,
          });
          return formatError(error);
        };
        return params;
      },
      schema,
      subscribe,
    },
    {
      path: `${apolloServer.graphqlPath}subscriptions`,
      server: httpServer,
    }
  );

  // Shut down in the case of interrupt and termination signals
  // We expect to handle this more cleanly in the future. See (#5074)[https://github.com/apollographql/apollo-server/issues/5074] for reference.
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => subscriptionServer.close());
  });
};

export default createSubscriptionServer;
