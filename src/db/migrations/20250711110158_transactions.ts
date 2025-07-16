import Knex from 'knex';

exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('trx_', md5(cast(random() as varchar(255))))"));

    table.string('user_id').references('id').inTable('users').notNullable();
    table.string('stripe_customer_id').notNullable();

    table.string('stripe_price_id').nullable();
    table.string('stripe_intent_id').nullable();
    table.string('stripe_subscription_id').nullable();
    table.string('stripe_invoice_id').nullable();
    table.string('stripe_coupon_id').nullable();

    table.integer('discount_amount_in_cents').nullable();
    table.integer('discount_percentage').nullable();

    table.integer('amount_in_cents').notNullable();

    table.string('currency').defaultTo('eur').notNullable();

    table.string('name').nullable();
    table.string('description').nullable();
    table.string('status').nullable();

    table.jsonb('metadata').nullable();

    table.boolean('is_subscription').defaultTo(false).notNullable();
    table.boolean('auto_renew').defaultTo(true).notNullable();

    table.dateTime('trial_end').nullable();
    table.dateTime('current_period_start').nullable();
    table.dateTime('current_period_end').nullable();

    table.dateTime('paid_at').nullable();
    table.dateTime('canceled_at').nullable();

    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('transactions');
};
