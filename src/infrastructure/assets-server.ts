import config from 'config';
import express from 'express';

import logger from './logger';
import routes from './server/routes';

const assetsServer = express();
assetsServer.disable('x-powered-by');

const ASSETS_ROOT_PATH = routes.assets;
assetsServer.use(ASSETS_ROOT_PATH, express.static(config.get('assets.path')));

const port = config.get('assets.port');

const startAssetsServer = () => {
  const server = assetsServer.listen(port, () => logger.info(`📂 Assets server ready at http://localhost:${port}`));

  const shutdown = () => server.close(() => process.exit(0));

  process.on('SIGINT', () => shutdown());
  process.on('SIGTERM', () => shutdown());

  process.once('SIGUSR2', () => {
    shutdown();
    process.kill(process.pid, 'SIGUSR2');
  });
};

export default startAssetsServer;
