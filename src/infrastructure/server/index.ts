import { createServer } from 'http';
import path from 'path';

import { ApolloServerPluginLandingPageDisabled } from 'apollo-server-core';
import { ApolloError, ApolloServer } from 'apollo-server-express';
import config from 'config';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';

import schema from '../../graphql';
import IS_DEV_ENVIRONNEMENT from '../../shared/isDevEnvironnement';
import logger from '../logger';
import { formatError, logApolloError } from './errorsHandlers';
import expressErrorHandler from './errorsHandlers/expressErrorHandlers';
import getContext from './getContext';
import graphqlLoggerPlugin from './logger-plugin';
import routes from './routes';
import createSubscriptionServer from './subscription-server';
import WebhooksServer from './webhook-server';

const apolloServer = new ApolloServer({
  context: async ({ req }) => {
    try {
      return await getContext({
        httpCookie: req.get('X-Http-Cookie'),
        ipAddress: req.get('X-Forwarded-For') ?? req.socket.remoteAddress,
        platform: req.get('App-Client-Platform') || '',
        requestId: req.get('X-Request-Id'),
        token: req.get('Authorization')?.replace('Bearer ', ''),
      });
    } catch (error) {
      if (!(error instanceof ApolloError)) {
        logger.error('[GRAPHQL] error during context creation', {
          error,
          errorStack: error.stack || error.extensions?.exception?.stacktrace,
        });
      } else {
        logApolloError({
          ApolloEr: error,
          logObject: error,
          logger,
        });
      }
      throw error;
    }
  },
  formatError,
  plugins: [graphqlLoggerPlugin, ApolloServerPluginLandingPageDisabled()],
  schema,
});

const port = process.env.PORT || config.get('server.port');
const version = config.get('server.version');
const WEBHOOKS_ROOT_PATH = routes.webhooks.root;
const APP_ROOT_PATH = routes.root;

const startApolloServer = async () => {
  const app: any = express();

  if (IS_DEV_ENVIRONNEMENT) {
    const PUBLIC_PATH = path.join(__dirname, '../../../public');
    app.use('/api-reference', express.static(PUBLIC_PATH));
  }

  const httpServer = createServer(app);
  app.use(graphqlUploadExpress());
  app.use(WEBHOOKS_ROOT_PATH, WebhooksServer);

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    path: APP_ROOT_PATH,
  });

  createSubscriptionServer({
    apolloServer,
    httpServer,
  });

  app.use(expressErrorHandler);

  await new Promise((resolve: any) => httpServer.listen({ port }, resolve));
  logger.info(`🚀 Server version ${version} ready at http://localhost:${port}/`);
  if (IS_DEV_ENVIRONNEMENT) {
    logger.info(`📄 Documentation: http://localhost:${port}/api-reference`);
  }
};

export default startApolloServer;
