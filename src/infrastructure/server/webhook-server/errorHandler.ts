import logger from '../../logger';
import getLogMetadata from '../logger-plugin/getLogMetadata';

const errorHandler = ({ err, req }) => {
  logger.error('[WEBHOOKS] Error during webhook request', getLogMetadata({ err, req }));
};

export default errorHandler;
