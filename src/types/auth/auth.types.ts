import { Request } from 'express';
import { UserRoleType } from '../user/user.types';

/**
 * Interface pour les données d'authentification
 */
export interface AuthData {
  token: string;
  user: UserAuthData;
}

/**
 * Interface pour les données utilisateur d'authentification
 */
export interface UserAuthData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRoleType;
}

/**
 * Interface pour les données d'inscription d'un utilisateur
 */
export interface RegisterUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  placeId?: string;
  recaptchaToken: string;
}

/**
 * Interface pour les données de connexion d'un utilisateur
 */
export interface LoginUserData {
  email: string;
  password: string;
}

/**
 * Interface pour la requête authentifiée
 */
export interface AuthenticatedRequest extends Request {
  user?: UserAuthData;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
}
