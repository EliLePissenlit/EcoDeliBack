import fs from 'fs';
import path from 'path';

import { beforeAll, describe, expect, it } from '@jest/globals';

import { getInstance } from '../db';
import { tablesToClean as tables } from '../db/seeds/01-clean_db';
import logger from '../infrastructure/logger';

describe('Database Migrations', () => {
  let knex: any;

  const migrationsDir = path.join(__dirname, '../db', 'migrations');

  const applyMigrations = async (direction: 'up' | 'down') => {
    const migrationFiles = fs.readdirSync(migrationsDir);

    for (const file of migrationFiles) {
      try {
        // eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires, global-require
        const migration = require(path.join(migrationsDir, file));
        if (migration[direction]) {
          if (!knex.schema.hasTable) {
            logger.info(`Applying migration: ${file} - ${direction}`);
            await migration[direction](knex);
          }
        }
      } catch (error) {
        logger.error(`Error during ${direction} migration: ${file}`, error);
        throw error;
      }
    }
  };

  beforeAll(async () => {
    knex = await getInstance();
  });

  it('should apply all "up" migrations', async () => {
    await applyMigrations('up');

    for (const table of tables) {
      const exists = await knex.schema.hasTable(table);
      expect(exists).toBe(true);
    }
  });
});
