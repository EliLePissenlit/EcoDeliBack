import { User } from '../../database/models/User';
import { UpdateUserInput } from '../../types/user/user.types';
import { RegisterUserData } from '../../types/auth/auth.types';
import { UserRole } from '../../constants/roles';

export class UserService {
  /**
   * Crée un nouvel utilisateur
   */
  public static async createUser(data: RegisterUserData): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    /*    // Créer le client Stripe
    const stripeCustomerId = await StripeService.createCustomer(
      data.email,
      `${data.firstName} ${data.lastName}`
    ); */

    // Créer l'utilisateur avec le stripeCustomerId
    const user = await User.create({
      ...data,
      //stripeCustomerId,
      role: UserRole.USER,
      isEmailVerified: false,
      isSuspended: false,
    });

    return user;
  }

  /**
   * Met à jour un utilisateur
   */
  public static async updateUser(input: UpdateUserInput): Promise<User> {
    const user = await User.findByPk(input.id);
    if (!user) {
      throw new Error('User not found');
    }

    // Mise à jour des champs
    if (input.email) user.email = input.email;
    if (input.firstName) user.firstName = input.firstName;
    if (input.lastName) user.lastName = input.lastName;
    if (input.phone) user.phone = input.phone;
    if (input.placeId) user.placeId = input.placeId;
    if (input.role) user.role = input.role;
    if (typeof input.isEmailVerified === 'boolean') user.isEmailVerified = input.isEmailVerified;
    if (typeof input.isSuspended === 'boolean') user.isSuspended = input.isSuspended;

    await user.save();
    /* 
    // Si l'utilisateur a un stripeCustomerId, mettre à jour les informations dans Stripe
    if (user.stripeCustomerId) {
      await StripeService.updateCustomer(user.stripeCustomerId, {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });
    } */

    return user;
  }

  /**
   * Suspend un utilisateur
   */
  public static async suspendUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isSuspended = true;
    await user.save();
    return user;
  }

  /**
   * Réactive un utilisateur
   */
  public static async unsuspendUser(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isSuspended = false;
    await user.save();
    return user;
  }

  /**
   * Trouve un utilisateur par son ID
   */
  public static async findById(id: number): Promise<User | null> {
    return User.findByPk(id);
  }

  /**
   * Trouve un utilisateur par son email
   */
  public static async findByEmail(email: string): Promise<User | null> {
    return User.findByEmail(email);
  }

  /**
   * Liste tous les utilisateurs avec pagination
   */
  public static async listUsers(
    page: number = 1,
    limit: number = 10
  ): Promise<{ users: User[]; total: number }> {
    const offset = (page - 1) * limit;

    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return {
      users: rows,
      total: count,
    };
  }
}
