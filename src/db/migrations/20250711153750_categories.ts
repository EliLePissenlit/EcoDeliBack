exports.up = async function (knex) {
  await knex.schema.createTable('categories', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('cat_', md5(cast(random() as varchar(255))))"));
    table.string('file_id').references('id').inTable('files').nullable();
    table.string('name').notNullable();
    table.string('color').nullable();
    table.string('description').nullable();
    table.integer('amount_in_cents').notNullable();
    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTable('categories');
};
