import jwt from 'jsonwebtoken';
import { logger } from '../logger';
import { UserAuthData } from '../../types/auth/auth.types';
import { User } from '../../database/models/User';

/**
 * Génère un token JWT pour un utilisateur
 * @param userId - L'ID de l'utilisateur
 * @returns Le token JWT généré
 */
export const generateJwtToken = (userId: number): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
};

/**
 * Vérifie un token JWT
 * @param token - Le token à vérifier
 * @returns L'ID de l'utilisateur ou null si le token est invalide
 */
export const verifyJwtToken = (token: string): number | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as {
      userId: number;
    };
    return decoded.userId;
  } catch (error) {
    logger.error('Erreur de vérification du token', { error });
    return null;
  }
};

/**
 * Extrait le token du header d'autorisation
 * @param authHeader - Le header d'autorisation
 * @returns Le token extrait ou null si invalide
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  return token || null;
};

/**
 * Transforme un utilisateur en données d'authentification
 * @param user - L'utilisateur à transformer
 * @returns Les données d'authentification formatées
 */
export const formatUserAuthData = (user: User): UserAuthData => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
});
