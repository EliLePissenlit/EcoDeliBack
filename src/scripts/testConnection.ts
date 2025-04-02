import sequelize from '../config/database';

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection bdd.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la bdd:', error);
  } finally {
    process.exit();
  }
}

testConnection(); 