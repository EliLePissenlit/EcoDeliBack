import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
const bcrypt = require('bcryptjs');

export enum UserRole {
  CLIENT = 'client',
  LIVREUR = 'livreur',
  PRESTATAIRE = 'prestataire',
  COMMERCANT = 'commercant'
}

export enum SubscriptionType {
  FREE = 'Free',
  STARTER = 'Starter',
  PREMIUM = 'Premium'
}

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  subscription_type: SubscriptionType;
  language: string;
  is_verified: boolean;
  is_admin: boolean;
  last_login: Date;
  created_at: Date;
}

interface UserCreationAttributes extends Omit<UserAttributes, 'id' | 'created_at'> {}

class User extends Model<UserAttributes, UserCreationAttributes> {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public phone!: string;
  public role!: UserRole;
  public subscription_type!: SubscriptionType;
  public language!: string;
  public is_verified!: boolean;
  public is_admin!: boolean;
  public last_login!: Date;
  public readonly created_at!: Date;

  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      console.log('Comparing passwords:');
      console.log('Candidate password:', candidatePassword);
      console.log('Stored hash:', this.password);
      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log('Match result:', isMatch);
      return isMatch;
    } catch (error) {
      console.error('Erreur lors de la comparaison des mots de passe:', error);
      return false;
    }
  }

  public async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
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
      validate: {
        len: [6, 100],
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15],
      },
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
      validate: {
        len: [2, 5],
      },
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
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        await user.hashPassword();
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          await user.hashPassword();
        }
      },
    },
  }
);

export default User; 