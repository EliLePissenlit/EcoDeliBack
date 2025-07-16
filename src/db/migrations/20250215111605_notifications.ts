import Knex from 'knex';

/**
 * Add table.
 *
 * @param {Knex} knex
 */
exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('notifications', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('not_', md5(cast(random() as varchar(255))))"));
    table.string('user_id').references('id').inTable('users');
    table.string('title').notNullable();
    table.string('type').notNullable();
    table.boolean('is_read').defaultTo(false).notNullable();
    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

/**
 * drop table.
 *
 * @param {knex} knex
 */
exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('notifications');
};
