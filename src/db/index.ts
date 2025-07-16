import config from 'config';
import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';

const commonConfig: knex.Config = {
  client: config.get('db.client'),
  ...knexSnakeCaseMappers({
    underscoreBeforeDigits: true,
  }),
};

const getInstance = async () => {
  if (process.env.NODE_ENV) {
    return knex({
      connection: {
        database: await config.get('db.connection.database'),
        host: await config.get('db.connection.host'),
        password: await config.get('db.connection.password'),
        user: await config.get('db.connection.user'),
      },
      ...commonConfig,
    });
  }

  return knex({
    connection: config.get('db.connection'),
    ...commonConfig,
  });
};

getInstance().then((instance) => Model.knex(instance));

export { getInstance };

export default Model;
