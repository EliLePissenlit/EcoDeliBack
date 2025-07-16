import logger from '../../logger';
import getLogMetadata from './getLogMetadata';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      url: string;
    }
  }
}

const expressLoggerHandler = (req: Express.Request, res: Express.Response, next, err) => {
  // Strict match "/" path
  const regex = /^\/$/;
  if (!regex.exec(req.url)) {
    logger.info(`[REST] ${req.url}`, getLogMetadata({ err, req }));
  }
  next();
};

export default expressLoggerHandler;
