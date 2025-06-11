import { QueryInterface } from 'sequelize';
import bcrypt from 'bcrypt';
import { UserRole } from '../../constants/roles';
import { User } from '../models/User';

module.exports = {
  async up(_queryInterface: QueryInterface) {
    const userPassword = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Utilisation du modèle User pour créer les utilisateurs
    await User.bulkCreate([
      {
        email: 'user@ecodeli.com',
        password: userPassword,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.USER,
        isEmailVerified: true,
        phone: '+33612345678',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Place ID pour Sydney, NSW, Australie
        stripeCustomerId: undefined,
        isSuspended: false,
      },
      {
        email: 'admin@ecodeli.com',
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isEmailVerified: true,
        phone: '+33687654321',
        placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4', // Place ID pour Sydney, NSW, Australie
        stripeCustomerId: undefined,
        isSuspended: false,
      },
    ]);
  },

  async down(_queryInterface: QueryInterface) {
    await User.destroy({
      where: {
        email: ['user@ecodeli.com', 'admin@ecodeli.com'],
      },
    });
  },
};
