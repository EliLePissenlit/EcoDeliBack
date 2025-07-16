import { PubSub, withFilter } from 'graphql-subscriptions';

import logger from '../logger';
import { logError } from './errorsHandlers';

const pubsub = new PubSub();

const originalPublish = pubsub.publish.bind(pubsub);

pubsub.publish = async function overriddenPublish(...params) {
  try {
    return await originalPublish(...params);
  } catch (error) {
    logger.error('[Graphql-publish] Error while publishing', {
      error,
      params,
    });
    throw error;
  }
};

const withSafeFilter = (subscribe, filter) =>
  withFilter(subscribe, async (payload, args, context, info) => {
    try {
      return await filter(payload, args, context, info);
    } catch (error) {
      logError({
        additionalInfo: {
          operationName: payload.operationName,
          variables: payload.variables,
        },
        error,
        logger: context.logger,
        source: 'SUBSCRIPTIONS',
      });
      return false;
    }
  });

export default pubsub;
export { withSafeFilter };
