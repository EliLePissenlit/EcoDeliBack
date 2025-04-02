import sequelize from '../config/database';
import { up } from '../migrations/20240402-add-is-admin';

async function runMigrations() {
  try {
    console.log('🌱 Démarrage des migrations...');
    await up(sequelize.getQueryInterface());
    console.log('✅ Migrations terminées avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  }
}

runMigrations(); 