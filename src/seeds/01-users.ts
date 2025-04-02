import User, { UserRole, SubscriptionType } from '../models/User';

export async function seedUsers() {
  try {
    // Supprimons d'abord tous les utilisateurs existants
    await User.destroy({ where: {} });

    await User.create({
      name: 'Admin',
      email: 'admin@ecodeli.com',
      password: 'admin123', // Le hash sera généré automatiquement par le hook beforeCreate
      phone: '0612345678',
      role: UserRole.CLIENT,
      is_admin: true,
      language: 'fr',
      subscription_type: SubscriptionType.PREMIUM,
      is_verified: true,
      last_login: new Date()
    });

    await User.create({
      name: 'Client Test',
      email: 'client@ecodeli.com',
      password: 'client123',
      phone: '0612345679',
      role: UserRole.CLIENT,
      is_admin: false,
      language: 'fr',
      subscription_type: SubscriptionType.STARTER,
      is_verified: true,
      last_login: new Date()
    });

    await User.create({
      name: 'Livreur Test',
      email: 'livreur@ecodeli.com',
      password: 'livreur123',
      phone: '0612345680',
      role: UserRole.LIVREUR,
      is_admin: false,
      language: 'fr',
      subscription_type: SubscriptionType.FREE,
      is_verified: true,
      last_login: new Date()
    });

    await User.create({
      name: 'Commerçant Test',
      email: 'commercant@ecodeli.com',
      password: 'commercant123',
      phone: '0612345681',
      role: UserRole.COMMERCANT,
      is_admin: false,
      language: 'fr',
      subscription_type: SubscriptionType.PREMIUM,
      is_verified: true,
      last_login: new Date()
    });

    console.log('✅ Utilisateurs créés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la création des utilisateurs:', error);
    throw error;
  }
} 