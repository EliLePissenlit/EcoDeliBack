import { ApolloServerPlugin, GraphQLRequestContext, GraphQLRequestListener } from 'apollo-server-plugin-base';

import NON_LOGGABLE_VARIABLES from '../../../shared/nonLoggableVariables';
import { logErrors } from '../errorsHandlers';
import removeNonLoggableVariables from './removeNonLoggableVariables';

const UNKNOWN_REQUEST = 'unknown request';

const getRequestName = (request) => {
  if (request.operationName) return request.operationName;
  try {
    const firstElement = request.query.split('\n')[1];
    return firstElement.trim().split(' ')[0];
  } catch (error) {
    return UNKNOWN_REQUEST;
  }
};

const graphqlLoggerPlugin: ApolloServerPlugin = {
  async requestDidStart(requestContext: GraphQLRequestContext): Promise<GraphQLRequestListener> {
    const { context, request } = requestContext;
    const requestName = getRequestName(request);

    context.logger.info(`[GRAPHQL] ${requestName}`, {
      operationName: requestName,
      query: request.query,
      variables: removeNonLoggableVariables({
        nonLoggableVariables: NON_LOGGABLE_VARIABLES[requestName],
        requestVariables: request.variables,
      }),
    });

    return {
      async didEncounterErrors(rc) {
        const { errors } = rc;
        logErrors({ additionalInfo: {}, errors, logger: context.logger });
      },
    };
  },
};

export default graphqlLoggerPlugin;
