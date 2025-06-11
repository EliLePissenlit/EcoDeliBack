import { Request, Response } from 'express';
import { UserService } from '../../services/user/user.service';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterUserData } from '../../types/auth/auth.types';
import { logger } from '../../utils/logger';
import { AuthenticatedRequest } from '../../types/auth/auth.types';

export class AuthController {
  /**
   * Inscrit un nouvel utilisateur
   */
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterUserData = req.body;
      const user = await UserService.createUser(userData);
      const token = AuthService.generateToken(user);

      // Générer le token de vérification d'email
      const verificationToken = AuthService.generateEmailVerificationToken(user);

      // Simuler l'envoi d'email
      logger.success('Email de vérification envoyé', {
        to: user.email,
        token: verificationToken,
      });

      res.status(201).json({
        success: true,
        data: {
          token,
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
        },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Error registering user:', { error });
      if (error.message === 'Email already exists') {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  }

  /**
   * Connecte un utilisateur
   */
  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await AuthService.login(req.body);

      res.json({
        success: true,
        data: {
          token,
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
        },
      });
    } catch (error) {
      logger.error('Error during login:', { error });
      if (error instanceof Error) {
        if (error.message === 'Invalid credentials') {
          res.status(401).json({ message: 'Identifiants invalides' });
        } else if (error.message === 'Account is suspended') {
          res.status(403).json({ message: 'Votre compte a été suspendu' });
        } else {
          res.status(500).json({ message: 'Erreur serveur' });
        }
      } else {
        res.status(500).json({ message: 'Erreur serveur' });
      }
    }
  }

  /**
   * Vérifie l'email de l'utilisateur
   */
  public static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const user = await AuthService.verifyEmailToken(token);

      if (!user) {
        res.status(400).json({ error: 'Token invalide ou expiré' });
        return;
      }

      user.isEmailVerified = true;
      await user.save();

      logger.success('Email vérifié avec succès', {
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: 'Email vérifié avec succès',
      });
    } catch (error) {
      logger.error('Error verifying email:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Change le mot de passe de l'utilisateur connecté
   */
  public static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as AuthenticatedRequest).user?.id;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { currentPassword, newPassword } = req.body;
      const user = await UserService.findById(userId);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const isValidPassword = await user.validatePassword(currentPassword);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Mot de passe actuel incorrect' });
        return;
      }

      user.password = newPassword;
      await user.save();

      logger.success('Mot de passe changé avec succès', {
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: 'Mot de passe changé avec succès',
      });
    } catch (error) {
      logger.error('Error changing password:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   */
  public static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const user = await UserService.findByEmail(email);

      if (!user) {
        // Pour des raisons de sécurité, on renvoie toujours un succès
        res.json({
          success: true,
          message: 'Si un compte existe avec cet email, un email de réinitialisation a été envoyé',
        });
        return;
      }

      const resetToken = AuthService.generatePasswordResetToken(user);

      // Simuler l'envoi d'email
      logger.success('Email de réinitialisation envoyé', {
        to: user.email,
        token: resetToken,
      });

      res.json({
        success: true,
        message: 'Si un compte existe avec cet email, un email de réinitialisation a été envoyé',
      });
    } catch (error) {
      logger.error('Error sending password reset email:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Réinitialise le mot de passe avec un token
   */
  public static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const user = await AuthService.verifyPasswordResetToken(token);

      if (!user) {
        res.status(400).json({ error: 'Token invalide ou expiré' });
        return;
      }

      user.password = newPassword;
      await user.save();

      logger.success('Mot de passe réinitialisé avec succès', {
        userId: user.id,
        email: user.email,
      });

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Error resetting password:', { error });
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
