import logger from '../../logger';
import routes from '../routes';
import getLogMetadata from './getLogMetadata';

const APP_ROOT_PATH = routes.root;

const expressRESTNotFoundHandler = (req, res, next, err) => {
  if (req.url.match(`^${APP_ROOT_PATH}$`)) return next();
  logger.warn('[REST] Request path not found', getLogMetadata({ err, req }));
  return res.status(404).send({ message: 'Not Found' });
};

export default expressRESTNotFoundHandler;
