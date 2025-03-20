import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole } from '../types/enums';

interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: string[];
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  roles: {
    type: [String],
    enum: Object.values(UserRole),
    default: ['user']
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: { type: String, default: 'France' },
  },
}, {
  timestamps: true,
});

userSchema.pre('save', function(next) {
  const user = this as IUser;
  if (!user.isModified('password')) {
    return next();
  }
  
  const salt = bcrypt.genSaltSync(10);
  user.password = bcrypt.hashSync(user.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(candidatePassword, user.password);
};

export const User = mongoose.model<IUser>('User', userSchema); 