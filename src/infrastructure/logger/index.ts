import config from 'config';
import winston, { format } from 'winston';

import consoleTransport from './console-transport';
import datadogTransport from './datadog-transport';

const TRANSPORTS: any = [consoleTransport];
if (datadogTransport) TRANSPORTS.push(datadogTransport);

const logger = winston.createLogger({
  exitOnError: false,
  format: format.combine(format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })),
  level: config.get('logger.level'),
  transports: TRANSPORTS,
});

/**
 * We wrap our custom logger to provide a context logger
 * that will add automatically meta info like the requestID
 */
const logWithMetaInfo = (level, metaInfo) => (message, params) => {
  const info =
    params instanceof Error
      ? {
          error: params,
          errorStack: params.stack ?? (params as any).extensions?.exception?.stacktrace,
        }
      : { ...(params || {}) };
  logger[level](message, { ...info, ...metaInfo });
};

const getContextLogger = (metaInfo) => ({
  /* eslint-disable sort-keys-fix/sort-keys-fix */
  error: logWithMetaInfo('error', metaInfo),
  warn: logWithMetaInfo('warn', metaInfo),
  info: logWithMetaInfo('info', metaInfo),
  http: logWithMetaInfo('http', metaInfo),
  verbose: logWithMetaInfo('verbose', metaInfo),
  debug: logWithMetaInfo('debug', metaInfo),
  silly: logWithMetaInfo('silly', metaInfo),
  /* eslint-enable sort-keys-fix/sort-keys-fix */
});

/**
 * the only supported log format is logger[level](message, object)
 * where object is optional
 *
 * ATTENTION : you must use the contextLogger as soon as you are
 * in the scope of a request Which is basically almost always the case
 */
export default logger;
export { getContextLogger };
