import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('tasks', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('tsk_', md5(cast(random() as varchar(255))))"));

    table.string('user_id').references('id').inTable('users').notNullable();
    table.string('category_id').references('id').inTable('categories').nullable();
    table.enum('type', ['SERVICE', 'SHIPPING']).notNullable();
    table
      .enum('status', ['DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'COMPLETED', 'DONE', 'CANCELLED'])
      .notNullable()
      .defaultTo('DRAFT');

    table.string('title').notNullable();
    table.text('description').notNullable();
    table.integer('estimated_duration').nullable(); // en heures pour les services
    table.string('file_id').references('id').inTable('files').nullable();
    table.string('address_id').references('id').inTable('addresses').notNullable();
    table.integer('calculated_price_in_cents').nullable(); // prix calculé selon le type de tâche

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('tasks');
};
