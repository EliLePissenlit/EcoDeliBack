import Stripe from 'stripe';
import { logger } from '../../utils/logger';

export class StripeService {
  private static readonly stripe: Stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2025-05-28.basil',
  });

  /**
   * Crée un nouveau client Stripe
   * @param email - Email du client
   * @param name - Nom complet du client
   * @returns L'ID du client Stripe créé
   */
  public static async createCustomer(email: string, name: string): Promise<string> {
    try {
      const customer = await StripeService.stripe.customers.create({
        email,
        name,
      });
      return customer.id;
    } catch (error) {
      logger.error('Error creating Stripe customer:', { error });
      throw error;
    }
  }

  /**
   * Met à jour un client Stripe
   * @param customerId - ID du client Stripe
   * @param data - Données à mettre à jour
   */
  public static async updateCustomer(
    customerId: string,
    data: Stripe.CustomerUpdateParams
  ): Promise<void> {
    try {
      await StripeService.stripe.customers.update(customerId, data);
    } catch (error) {
      logger.error('Error updating Stripe customer:', { error });
      throw error;
    }
  }

  /**
   * Supprime un client Stripe
   * @param customerId - ID du client Stripe
   */
  public static async deleteCustomer(customerId: string): Promise<void> {
    try {
      await StripeService.stripe.customers.del(customerId);
    } catch (error) {
      logger.error('Error deleting Stripe customer:', { error });
      throw error;
    }
  }
}
