import config from 'config';

const environment = process.env.NODE_ENV || 'default';

const extension = environment === 'production' ? 'js' : 'ts';

const migrationsDirectory = environment === 'production' ? './dist/db/migrations' : './src/db/migrations';
const seedsDirectory = environment === 'production' ? './dist/db/seeds' : './src/db/seeds';

const commonConfig = {
  client: config.get('db.client'),
  migrations: {
    directory: migrationsDirectory,
    extension: `${extension}`,
    loadextensions: [`.${extension}`],
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: seedsDirectory,
    extension: `${extension}`,
    loadextensions: [`.${extension}`],
  },
};

const getRemoteServerConfig = async () => ({
  connection: {
    database: await config.get('db.connection.database'),
    host: await config.get('db.connection.host'),
    password: await config.get('db.connection.password'),
    ssl: {
      rejectUnauthorized: false,
    },
    user: await config.get('db.connection.user'),
  },

  ...commonConfig,
});

const knexConfig = {
  default: {
    connection: config.get('db.connection'),
    ...commonConfig,
  },
  production: getRemoteServerConfig,
  test: getRemoteServerConfig,
};

module.exports = knexConfig[environment];
