import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('shippings', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('shp_', md5(cast(random() as varchar(255))))"));

    table.string('task_id').references('id').inTable('tasks').notNullable().onDelete('CASCADE');
    table.enum('package_category', ['SMALL', 'MEDIUM', 'LARGE']).notNullable();
    table.string('pickup_address_id').references('id').inTable('addresses').notNullable();
    table.string('delivery_address_id').references('id').inTable('addresses').notNullable();
    table.json('package_details').nullable(); // détails du colis (poids, dimensions, etc.)
    table.float('estimated_distance_in_meters').nullable();
    table.float('estimated_duration_in_minutes').nullable();
    table.integer('calculated_price_in_cents').nullable();

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('shippings');
};
