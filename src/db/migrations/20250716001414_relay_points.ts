import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('relay_points', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('rly_', md5(cast(random() as varchar(255))))"));

    table.string('user_id').references('id').inTable('users').notNullable();
    table.string('file_id').references('id').inTable('files').nullable();

    table.string('name').notNullable();
    table.string('description').notNullable();

    table.string('address_id').nullable().references('id').inTable('addresses');

    table
      .json('opening_days')
      .notNullable()
      .defaultTo(
        JSON.stringify([
          { close: '18:00', day: 'monday', isOpen: true, open: '09:00' },
          { close: '18:00', day: 'tuesday', isOpen: true, open: '09:00' },
          { close: '18:00', day: 'wednesday', isOpen: true, open: '09:00' },
          { close: '18:00', day: 'thursday', isOpen: true, open: '09:00' },
          { close: '18:00', day: 'friday', isOpen: true, open: '09:00' },
          { close: '12:00', day: 'saturday', isOpen: true, open: '09:00' },
          { close: '00:00', day: 'sunday', isOpen: false, open: '00:00' },
        ])
      );

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('relay_points');
};
