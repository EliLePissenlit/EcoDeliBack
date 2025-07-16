import Knex from 'knex';

/**
 * Migration pour créer la table addresses avec PostGIS et index géospatial
 * @param {Knex} knex Instance de Knex.
 */
exports.up = async function (knex: Knex): Promise<void> {
  // Activer l'extension PostGIS si elle n'existe pas
  await knex.raw('CREATE EXTENSION IF NOT EXISTS postgis');

  // Créer la table addresses avec PostGIS en une seule requête
  await knex.raw(`
    CREATE TABLE addresses (
      id VARCHAR(255) PRIMARY KEY DEFAULT concat('add_', md5(cast(random() as varchar(255)))),
      main_text VARCHAR(255) NOT NULL,
      secondary_text VARCHAR(255) NOT NULL,
      lat DECIMAL(9,6) NOT NULL,
      lng DECIMAL(9,6) NOT NULL,
      place_id VARCHAR(255) NOT NULL,
      full_address VARCHAR(255) NOT NULL,
      location_type VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      geom geometry(Point, 4326)
    )
  `);

  // Créer un index spatial pour les performances
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_addresses_geom 
    ON addresses USING GIST (geom)
  `);

  // Créer un index sur lat/lng pour les requêtes simples
  await knex.raw(`
    CREATE INDEX IF NOT EXISTS idx_addresses_lat_lng 
    ON addresses (lat, lng)
  `);
};

/**
 * @param {Knex} knex Instance de Knex.
 */
exports.down = async function (knex: Knex): Promise<void> {
  // Supprimer les index
  await knex.raw('DROP INDEX IF EXISTS idx_addresses_geom');
  await knex.raw('DROP INDEX IF EXISTS idx_addresses_lat_lng');

  // Supprimer la table addresses (cela supprimera aussi la colonne geom)
  await knex.schema.dropTable('addresses');

  // Note: On ne supprime pas l'extension PostGIS car elle pourrait être utilisée ailleurs
};
