import sequelize from '../config/database';

async function resetDatabase() {
  try {
    console.log('🔄 Réinitialisation de la base de données...');
    
    await sequelize.query('DROP TABLE IF EXISTS "users" CASCADE;');
    
    console.log('✅ Base de données réinitialisée avec succès');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    process.exit(1);
  }
}

resetDatabase(); 