require('ts-node/register');
require('tsconfig-paths/register');

// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./config.ts').default;
module.exports = config;
