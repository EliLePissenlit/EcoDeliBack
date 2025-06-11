import { DataTypes, QueryInterface } from 'sequelize';
import { UserRole } from '../../constants/roles';

/** @type {import('sequelize').QueryInterface} */
module.exports = {
  async up(queryInterface: QueryInterface) {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...(Object.values(UserRole) as [string, ...string[]])),
        allowNull: false,
        defaultValue: UserRole.USER,
      },
      is_email_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      place_id: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Google Maps Place ID for the user address',
      },
      stripe_customer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_suspended: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    // Ajout d'un index sur l'email pour optimiser les recherches
    await queryInterface.addIndex('users', ['email']);
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('users');
  },
};
