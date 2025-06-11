import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { logger } from '../../utils/logger';

export class AdminUserController {
  /**
   * Liste tous les utilisateurs
   */
  public static async listUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const { users, total } = await UserService.listUsers(page, limit);

      res.json({
        success: true,
        data: {
          users: users.map((user) => ({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            phone: user.phone,
            placeId: user.placeId,
            isSuspended: user.isSuspended,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          })),
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      logger.error('Error listing users:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Met à jour un utilisateur
   */
  public static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.updateUser(req.body);
      res.json({
        success: true,
        user: {
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
      logger.error('Error updating user:', { error });
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * Suspend un utilisateur
   */
  public static async suspendUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.suspendUser(Number(req.params.userId));
      res.json({
        success: true,
        user: {
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
      logger.error('Error suspending user:', { error });
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * Réactive un utilisateur suspendu
   */
  public static async unsuspendUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserService.unsuspendUser(Number(req.params.userId));
      res.json({
        success: true,
        user: {
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
      logger.error('Error unsuspending user:', { error });
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }
}
