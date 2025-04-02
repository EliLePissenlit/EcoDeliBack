import User, { UserRole } from '../models/User';
import jwt from 'jsonwebtoken';
import { ApiResponse } from '../types';

export class UserService {
  static async register(userData: any): Promise<ApiResponse> {
    try {
      const user = await User.create({
        ...userData,
        role: UserRole.CLIENT,
        is_admin: false
      });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
      return { success: true, data: { user, token } };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { success: false, error: 'Erreur lors de l\'inscription' };
    }
  }

  static async login(email: string, password: string): Promise<ApiResponse> {
    try {
      console.log('Tentative de connexion pour:', email);
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        console.log('Utilisateur non trouvé');
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      const isValidPassword = await user.comparePassword(password);
      console.log('Résultat de la validation du mot de passe:', isValidPassword);

      if (!isValidPassword) {
        return { success: false, error: 'Email ou mot de passe incorrect' };
      }

      user.last_login = new Date();
      await user.save();

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET!);
      console.log('Token généré:', token);
      
      return { success: true, data: { user, token } };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { success: false, error: 'Erreur lors de la connexion' };
    }
  }

  static async getProfile(userId: number): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la récupération du profil' };
    }
  }

  static async updateProfile(userId: number, updates: any): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      const allowedUpdates = ['name', 'email', 'password', 'phone', 'language'];
      const validUpdates = Object.keys(updates).filter(key => allowedUpdates.includes(key));
      
      if (validUpdates.length === 0) {
        return { success: false, error: 'Aucune mise à jour valide' };
      }

      validUpdates.forEach(update => (user as any)[update] = updates[update]);
      await user.save();

      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la mise à jour du profil' };
    }
  }

  static async deleteAccount(userId: number): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      await user.destroy();
      return { success: true, data: { message: 'Compte supprimé avec succès' } };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression du compte' };
    }
  }

  // Méthodes admin
  static async getAllUsers(): Promise<ApiResponse> {
    try {
      const users = await User.findAll();
      return { success: true, data: users };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la récupération des utilisateurs' };
    }
  }

  static async updateUserRole(userId: number, role: UserRole): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      if (!Object.values(UserRole).includes(role)) {
        return { success: false, error: 'Rôle invalide' };
      }

      user.role = role;
      await user.save();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la modification du rôle' };
    }
  }

  static async updateAdminStatus(userId: number, isAdmin: boolean): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }

      user.is_admin = isAdmin;
      await user.save();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la modification du statut admin' };
    }
  }

  static async deleteUser(userId: number): Promise<ApiResponse> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return { success: false, error: 'Utilisateur non trouvé' };
      }
      await user.destroy();
      return { success: true, data: { message: 'Utilisateur supprimé avec succès' } };
    } catch (error) {
      return { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' };
    }
  }
} 