import { ApolloError, AuthenticationError } from 'apollo-server-express';

const logApolloError = ({ ApolloEr, logObject, logger, source = 'GRAPHQL' }) => {
  const loggerLevel = ApolloEr instanceof AuthenticationError ? 'warn' : ApolloEr.extensions?.loggerLevel || 'error';
  logger[loggerLevel](`[${source}] ${ApolloEr.message}`, logObject);
};

const logError = ({ additionalInfo, error, logger, source = 'GRAPHQL' }) => {
  const logObject = additionalInfo ? { error, ...additionalInfo } : error;
  if (error instanceof ApolloError) {
    logApolloError({
      ApolloEr: error,
      logObject,
      logger,
      source,
    });
  } else if (error.originalError instanceof ApolloError) {
    logApolloError({
      ApolloEr: error.originalError,
      logObject,
      logger,
      source,
    });
  } else {
    logger.error(`[${source}] ${error.message}`, logObject);
  }
};

const logErrors = ({ additionalInfo, errors, logger, source = 'GRAPHQL' }) => {
  if (!errors) return;
  for (const error of errors) {
    logError({
      additionalInfo,
      error,
      logger,
      source,
    });
  }
};

const formatError = (error) => {
  if (error.originalError instanceof ApolloError || error instanceof ApolloError) {
    return error;
  }
  return new Error(error.message);
};

export { logErrors, logError, formatError, logApolloError };
