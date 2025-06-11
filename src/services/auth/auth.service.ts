import { User } from '../../database/models/User';
import { UserRole } from '../../constants/roles';
import {
  AuthData,
  UserAuthData,
  RegisterUserData,
  LoginUserData,
  ForgotPasswordData,
  ResetPasswordData,
} from '../../types/auth/auth.types';
import { generateJwtToken, formatUserAuthData } from '../../utils/auth/auth.utils';
import { logger } from '../../utils/logger';
import jwt from 'jsonwebtoken';
import { UserService } from '../user/user.service';
import { SendGridService } from '../../external-services/sendgrid';

/**
 * Service d'authentification
 * Gère l'authentification des utilisateurs et la génération des tokens JWT
 */
export class AuthService {
  private static readonly JWT_EXPIRATION = '24h';
  private static readonly EMAIL_VERIFICATION_EXPIRES_IN = '24h';
  private static readonly PASSWORD_RESET_EXPIRES_IN = '1h';

  /**
   * Génère un token JWT pour un utilisateur
   */
  public static generateToken(user: User): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: AuthService.JWT_EXPIRATION }
    );
  }

  /**
   * Génère un token pour la vérification d'email
   */
  public static generateEmailVerificationToken(user: User): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'email-verification',
      },
      process.env.JWT_SECRET,
      { expiresIn: AuthService.EMAIL_VERIFICATION_EXPIRES_IN }
    );
  }

  /**
   * Génère un token pour la réinitialisation de mot de passe
   */
  public static generatePasswordResetToken(user: User): string {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        type: 'password-reset',
      },
      process.env.JWT_SECRET,
      { expiresIn: AuthService.PASSWORD_RESET_EXPIRES_IN }
    );
  }

  /**
   * Authentifie un utilisateur
   */
  public static async login(loginData: LoginUserData): Promise<{ user: User; token: string }> {
    const user = await User.findByEmail(loginData.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await user.validatePassword(loginData.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.isSuspended) {
      throw new Error('Account is suspended');
    }

    const token = AuthService.generateToken(user);
    return { user, token };
  }

  /**
   * Enregistre un nouvel utilisateur
   * @param userData - Les données de l'utilisateur
   * @returns Les données d'authentification ou null si l'enregistrement échoue
   */
  static async register(userData: RegisterUserData): Promise<AuthData | null> {
    try {
      const existingUser = await User.findByEmail(userData.email);
      if (existingUser) {
        logger.warn("Tentative d'inscription avec email existant", { email: userData.email });
        return null;
      }

      const user = await User.create({
        ...userData,
        role: UserRole.USER,
        isEmailVerified: false,
        isSuspended: false,
      });

      const token = generateJwtToken(user.id);
      return {
        token,
        user: formatUserAuthData(user),
      };
    } catch (error) {
      logger.error("Erreur lors de l'inscription", { error, email: userData.email });
      return null;
    }
  }

  /**
   * Vérifie si un token est valide
   */
  public static verifyToken(token: string): { id: number; email: string; role: string } {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        email: string;
        role: string;
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  /**
   * Récupère les informations de l'utilisateur connecté
   * @param userId - L'ID de l'utilisateur
   * @returns Les informations de l'utilisateur ou null si non trouvé
   */
  static async getCurrentUser(userId: number): Promise<UserAuthData | null> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        logger.warn('Utilisateur non trouvé', { userId });
        return null;
      }

      return formatUserAuthData(user);
    } catch (error) {
      logger.error("Erreur lors de la récupération de l'utilisateur", { error, userId });
      return null;
    }
  }

  /**
   * Vérifie un token de vérification d'email
   */
  public static async verifyEmailToken(token: string): Promise<User | null> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        email: string;
        type: string;
      };

      if (decoded.type !== 'email-verification') {
        return null;
      }

      const user = await UserService.findById(decoded.id);
      if (!user || user.email !== decoded.email) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Error verifying email token:', { error });
      return null;
    }
  }

  /**
   * Vérifie un token de réinitialisation de mot de passe
   */
  public static async verifyPasswordResetToken(token: string): Promise<User | null> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        id: number;
        email: string;
        type: string;
      };

      if (decoded.type !== 'password-reset') {
        return null;
      }

      const user = await UserService.findById(decoded.id);
      if (!user || user.email !== decoded.email) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Error verifying password reset token:', { error });
      return null;
    }
  }

  /**
   * Gère la demande de réinitialisation de mot de passe
   */
  public static async forgotPassword(data: ForgotPasswordData): Promise<boolean> {
    try {
      const user = await User.findByEmail(data.email);
      if (!user) {
        // On retourne true même si l'utilisateur n'existe pas pour des raisons de sécurité
        return true;
      }

      const resetToken = AuthService.generatePasswordResetToken(user);
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await SendGridService.sendEmail(
        user.email,
        'Réinitialisation de votre mot de passe',
        `Bonjour ${user.firstName},\n\nPour réinitialiser votre mot de passe, cliquez sur le lien suivant : ${resetLink}\n\nCe lien expirera dans 1 heure.`,
        `
          <h1>Bonjour ${user.firstName},</h1>
          <p>Pour réinitialiser votre mot de passe, cliquez sur le lien suivant :</p>
          <a href="${resetLink}">Réinitialiser mon mot de passe</a>
          <p>Ce lien expirera dans 1 heure.</p>
        `
      );

      return true;
    } catch (error) {
      logger.error('Erreur lors de la demande de réinitialisation de mot de passe:', { error });
      throw error;
    }
  }

  /**
   * Réinitialise le mot de passe d'un utilisateur
   */
  public static async resetPassword(data: ResetPasswordData): Promise<boolean> {
    try {
      const user = await AuthService.verifyPasswordResetToken(data.token);
      if (!user) {
        throw new Error('Token de réinitialisation invalide ou expiré');
      }

      await user.update({ password: data.newPassword });
      return true;
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation du mot de passe:', { error });
      throw error;
    }
  }
}
