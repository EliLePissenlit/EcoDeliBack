import Knex from 'knex';

/**
 * Add table.
 *
 * @param {Knex} knex
 */
exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('files', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('file_', md5(cast(random() as varchar(255))))"));
    table.string('user_id').references('id').inTable('users');
    table.string('display_name').notNullable();
    table.string('file_name').notNullable();
    table.string('file_type').notNullable();
    table.boolean('is_folder').defaultTo(false);
    table.string('parent_folder_id').references('id').inTable('files').onUpdate('CASCADE').onDelete('CASCADE');
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
  await knex.schema.dropTable('files');
};
