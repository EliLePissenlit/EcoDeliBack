import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../types';

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
  }
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new AuthError('Token d\'authentification manquant');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AuthError('Utilisateur non trouvé');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ 
        success: false, 
        error: error.message 
      });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ 
        success: false, 
        error: 'Token invalide' 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Erreur d\'authentification' 
      });
    }
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.is_admin) {
        next();
      } else {
        throw new AuthError('Accès refusé. Droits administrateur requis.', 403);
      }
    });
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.statusCode).json({ 
        success: false, 
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Erreur d\'authentification' 
      });
    }
  }
}; 