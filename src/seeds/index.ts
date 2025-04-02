import { seedUsers } from './01-users';

async function runSeeds() {
  try {
    console.log('🌱 Démarrage du seeding...');
    
    await seedUsers();
    
    console.log('✅ Seeding terminé avec succès !');
  } catch (error) {
    console.error('❌ Erreur lors du seeding :', error);
    process.exit(1);
  }
}

runSeeds(); 