import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('task_messages', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('msg_', md5(cast(random() as varchar(255))))"));

    table.string('task_id').references('id').inTable('tasks').notNullable().onDelete('CASCADE');
    table.string('sender_id').references('id').inTable('users').notNullable();
    table.string('receiver_id').references('id').inTable('users').notNullable();
    table.text('content').notNullable();
    table.enum('message_type', ['TEXT', 'VALIDATION_CODE', 'SYSTEM']).notNullable().defaultTo('TEXT');
    table.boolean('is_read').notNullable().defaultTo(false);

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('task_messages');
};
