import config from 'config';
import { format, transports } from 'winston';

const apiKey: string = config.get('logger.datadogApiKey');

const datadogTransport: any =
  apiKey &&
  new transports.Http({
    format: format.combine(format.timestamp(), format.json()),
    host: 'http-intake.logs.datadoghq.eu',
    // cspell-checker: disable-next-line
    path: `/v1/input/${apiKey}?ddsource=nodejs&service=api&ddtags=env:${config.get('logger.env')}`,
    ssl: true,
  });

export default datadogTransport;
