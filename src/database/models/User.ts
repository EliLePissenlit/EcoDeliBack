import { Model, DataTypes, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/sequelize';
import { UserRole, roleLevels } from '../../constants/roles';
import { UserRoleType } from '../../types/user/user.types';

// Interface pour les attributs d'un utilisateur
interface UserAttributes {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;
  isEmailVerified: boolean;
  phone?: string;
  placeId?: string;
  stripeCustomerId?: string;
  isSuspended: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour les attributs de création d'un utilisateur
interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

/**
 * Modèle User pour la gestion des utilisateurs
 */
export class User extends Model<UserAttributes, UserCreationAttributes> {
  declare id: number;
  declare email: string;
  declare password: string;
  declare firstName: string;
  declare lastName: string;
  declare role: UserRoleType;
  declare isEmailVerified: boolean;
  declare phone?: string;
  declare placeId?: string;
  declare stripeCustomerId?: string;
  declare isSuspended: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  /**
   * Vérifie si le mot de passe correspond
   * @param password - Le mot de passe à vérifier
   * @returns true si le mot de passe correspond
   */
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Trouve un utilisateur par son email
   * @param email - L'email de l'utilisateur
   * @returns L'utilisateur trouvé ou null
   */
  static async findByEmail(email: string): Promise<User | null> {
    return User.findOne({ where: { email } });
  }

  /**
   * Vérifie si l'utilisateur a un rôle suffisant
   * @param requiredRole - Le rôle requis
   * @returns true si le rôle est suffisant
   */
  hasRequiredRole(requiredRole: UserRoleType): boolean {
    return roleLevels[this.role] >= roleLevels[requiredRole];
  }

  /**
   * Vérifie si l'utilisateur est actif
   * @returns true si l'utilisateur n'est pas suspendu
   */
  isActive(): boolean {
    return !this.isSuspended;
  }
}

// Initialisation du modèle
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.USER,
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    placeId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Google Maps Place ID for the user address',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSuspended: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

User.beforeCreate(async (user: User) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.beforeUpdate(async (user: User) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});
