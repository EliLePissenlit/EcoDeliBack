import Knex from 'knex';

/**
 * Add table.
 *
 * @param {Knex} knex
 */
exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('usr_', md5(cast(random() as varchar(255))))"));
    table.string('email').unique().notNullable();
    table.string('stripe_customer_id').nullable();

    table.string('last_name').nullable();
    table.string('first_name').nullable();
    table.string('phone').nullable();

    table
      .enu('role', ['BASIC', 'ADMIN', 'TESTER', 'PARTNER', 'SUPER_ADMIN'], {
        enumName: 'users_roles_enum',
        useNative: true,
      })
      .notNullable()
      .defaultTo('BASIC');

    table.dateTime('last_login_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.string('password').notNullable();
    table.dateTime('password_updated_at').defaultTo(knex.fn.now()).notNullable();

    table.boolean('is_user_email_verified').defaultTo(false).notNullable();
    table.boolean('is_suspended').defaultTo(false).notNullable();
    table.boolean('is_under_surveillance').defaultTo(false).notNullable();

    table.string('last_address_id').nullable().references('id').inTable('addresses');
  });
};

/**
 * drop table.
 *
 * @param {knex} knex
 */
exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('users');
  // Remove enum type
  await knex.schema.raw(`
    DROP TYPE "users_roles_enum";
  `);
};
