import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../services/auth/auth.service';
import { roleLevels } from '../../constants/roles';
import { logger } from '../../utils/logger';
import { extractTokenFromHeader, verifyJwtToken } from '../../utils/auth/auth.utils';
import { AuthenticatedRequest } from '../../types/auth/auth.types';
import { UserRoleType } from '../../types/user/user.types';

type RequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void> | void;

/**
 * Middleware d'authentification
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 */
export const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      logger.warn("Tentative d'accès sans token", { path: req.path });
      res.status(401).json({ message: 'Token manquant' });
      return;
    }

    const userId = verifyJwtToken(token);
    console.log('[AdminUsers] userId décodé:', userId);
    if (!userId) {
      logger.warn('Token invalide', { path: req.path });
      res.status(401).json({ message: 'Token invalide' });
      return;
    }

    const user = await AuthService.getCurrentUser(userId);
    if (!user) {
      logger.warn('Utilisateur non trouvé', { userId, path: req.path });
      res.status(401).json({ message: 'Utilisateur non trouvé' });
      return;
    }

    (req as AuthenticatedRequest).user = user;

    logger.info('Authentification réussie', {
      userId: user.id,
      email: user.email,
      role: user.role,
      path: req.path,
    });

    console.log('JWT_SECRET utilisé:', process.env.JWT_SECRET);

    next();
  } catch (error) {
    logger.error("Erreur d'authentification", {
      error: error instanceof Error ? error.message : 'Unknown error',
      path: req.path,
    });
    res.status(500).json({ message: "Erreur d'authentification" });
  }
};

/**
 * Middleware de vérification de rôle
 * Vérifie si l'utilisateur a le niveau de rôle requis
 * @param requiredRole - Le rôle requis
 */
export const requireRole = (requiredRole: UserRoleType): RequestHandler => {
  return async (req, res, next) => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      logger.warn("Tentative d'accès sans authentification", { path: req.path });
      res.status(401).json({ message: 'Non authentifié' });
      return;
    }

    if (roleLevels[authReq.user.role] < roleLevels[requiredRole]) {
      logger.warn("Tentative d'accès avec rôle insuffisant", {
        userId: authReq.user.id,
        role: authReq.user.role,
        requiredRole,
        path: req.path,
      });
      res.status(403).json({ message: 'Accès non autorisé' });
      return;
    }

    next();
  };
};
