import _ from 'lodash';
import { SPLAT } from 'triple-beam';
import { format, transports } from 'winston';

const prettifyError = (error) =>
  error ? `\n${error.stack || JSON.stringify(error.extensions?.exception?.stacktrace, undefined, 2)}` : '';

/**
 * Create a custom log format to display errors in the console "like" console.log
 * mainly used for local debug purposes
 */
const formatSplat = (splat) => {
  if (!splat) return '';
  const splatFirstItem = splat[0];
  if (splatFirstItem === undefined) return '';
  if (splatFirstItem instanceof Error) return prettifyError(splatFirstItem);
  if (typeof splatFirstItem === 'object') {
    return `\n${JSON.stringify(_.omit(splatFirstItem, ['error', 'errorStack']), undefined, 2)}${prettifyError(
      splatFirstItem.error
    )}`;
  }
  return `\n${splatFirstItem}`;
};

const logFormat = format.printf(
  (info) => `${info.timestamp} ${info.level}: ${info.message}${formatSplat(info[SPLAT])}`
);

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), logFormat),
});

export default consoleTransport;
