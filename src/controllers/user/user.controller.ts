import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest } from '../../types/auth/auth.types';

export class UserController {
  /**
   * Récupère les informations de l'utilisateur connecté
   */
  public static async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          phone: user.phone,
          placeId: user.placeId,
          isSuspended: user.isSuspended,
        },
      });
    } catch (error) {
      logger.error('Error getting user profile:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   */
  public static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Mise à jour des champs autorisés
      if (req.body.firstName) user.firstName = req.body.firstName;
      if (req.body.lastName) user.lastName = req.body.lastName;
      if (req.body.phone) user.phone = req.body.phone;
      if (req.body.placeId) user.placeId = req.body.placeId;

      await user.save();

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          phone: user.phone,
          placeId: user.placeId,
          isSuspended: user.isSuspended,
        },
      });
    } catch (error) {
      logger.error('Error updating user profile:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
