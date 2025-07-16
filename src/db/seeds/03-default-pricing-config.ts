/* eslint-disable no-console */
import Knex from 'knex';

/**
 * Seed pour créer une configuration de prix par défaut
 * @param {Knex} knex Instance de Knex.
 */
exports.seed = async function (knex: Knex): Promise<void> {
  // Vérifier si une configuration active existe déjà
  const existingConfig = await knex('pricing_configs').where('is_active', true).first();

  if (!existingConfig) {
    // Créer la configuration par défaut
    await knex('pricing_configs').insert({
      // 8€
      base_price_large: 1200,

      base_price_medium: 800,

      // Prix de base par catégorie (en centimes)
      base_price_small: 500,

      created_at: new Date().toISOString(),

      is_active: true,
      name: 'Configuration par défaut', // 12€

      // Prix par distance et durée (en centimes)
      price_per_km: 50, // 0.50€ par km
      price_per_minute: 10, // 0.10€ par minute

      updated_at: new Date().toISOString(),
    });

    console.log('✅ Configuration de prix par défaut créée');
  } else {
    console.log('ℹ️  Configuration de prix active déjà existante, ignoré');
  }
};
