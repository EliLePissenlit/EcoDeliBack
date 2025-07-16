import Knex from 'knex';

// the order matters!
// tables are truncated in this order to prevent foreign key issues
// Order based on foreign key dependencies (child tables first, then parent tables)
export const tablesToClean = [
  // Tables enfants qui dépendent d'autres tables
  'task_messages', // depends on tasks, users
  'task_applications', // depends on tasks, users
  'shippings', // depends on tasks, addresses
  'tasks', // depends on users, categories, files, addresses
  'relay_points', // depends on users, files, addresses
  'categories', // depends on files
  'files', // depends on users
  'transactions', // depends on users
  'notifications', // depends on users

  // Tables parents (pas de dépendances)
  'users', // depends on addresses
  'addresses', // no dependencies
  'pricing_configs', // no dependencies
];

/**
 * Clean all tables for local environment reset.
 *
 * @param {Knex} knex
 */
exports.seed = async (knex: Knex): Promise<void> => {
  // wipe all tables for local environment reset
  for (const table of tablesToClean) {
    await knex(table).del();
  }
};
