import { getInstance } from '../../db';
import logger from '../../infrastructure/logger';

export const cleanDatabase = async (): Promise<void> => {
  try {
    const knex = await getInstance();

    await knex.transaction(async (trx) => {
      await trx.raw('SET CONSTRAINTS ALL DEFERRED');

      const tables = await trx.raw(`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `);

      const tableNames = tables.rows.map((row: any) => row.tablename);

      for (const table of tableNames) {
        await trx.raw(`TRUNCATE TABLE "${table}" CASCADE`);
      }
    });

    logger.info('Database cleaned successfully');
  } catch (error) {
    logger.error('Error while cleaning database', error);
    throw error;
  }
};
