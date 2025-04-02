import { QueryInterface, DataTypes } from 'sequelize';
import { UserRole, SubscriptionType } from '../models/User';

export async function up(queryInterface: QueryInterface) {
  // Création de la table users
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.CLIENT,
    },
    subscription_type: {
      type: DataTypes.ENUM(...Object.values(SubscriptionType)),
      allowNull: false,
      defaultValue: SubscriptionType.FREE,
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'fr',
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    }
  });
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('users');
} 