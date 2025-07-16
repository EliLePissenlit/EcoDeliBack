import Knex from 'knex';

/**
 * Migration pour la configuration des prix simplifiée
 * @param {Knex} knex Instance de Knex.
 */
exports.up = async function (knex: Knex): Promise<void> {
  await knex.schema.createTable('pricing_configs', (table) => {
    table.string('id').primary().defaultTo(knex.raw("concat('pricing_config_', md5(cast(random() as varchar(255))))"));

    // Informations de base
    table.string('name').notNullable();
    table.boolean('is_active').defaultTo(false).notNullable();

    // Configuration des prix de base par catégorie (en centimes)
    table.integer('base_price_small').notNullable(); // Prix de base petit colis
    table.integer('base_price_medium').notNullable(); // Prix de base moyen colis
    table.integer('base_price_large').notNullable(); // Prix de base gros colis

    // Configuration des prix par distance et durée (en centimes)
    table.integer('price_per_km').notNullable(); // Prix par km en centimes
    table.integer('price_per_minute').notNullable(); // Prix par minute en centimes

    // Timestamps
    table.dateTime('created_at').defaultTo(knex.fn.now()).notNullable();
    table.dateTime('updated_at').defaultTo(knex.fn.now()).notNullable();
  });
};

/**
 * @param {Knex} knex Instance de Knex.
 */
exports.down = async function (knex: Knex): Promise<void> {
  await knex.schema.dropTable('pricing_configs');
};
