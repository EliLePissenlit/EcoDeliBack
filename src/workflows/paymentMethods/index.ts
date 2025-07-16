import { ApolloError } from 'apollo-server-express';
import { User } from '../../types/graphql/typeDefs';
import StripeService from '../../external-services/stripe';
import logger from '../../infrastructure/logger';

class PaymentMethodWorkflow {
  public static async getUserPaymentMethods(user: User) {
    try {
      if (!user.stripeCustomerId) return [];

      const paymentMethods = await StripeService.getUserPaymentMethods(user.stripeCustomerId);

      return paymentMethods.map((pm) => ({
        brand: pm.card?.brand || 'unknown',
        expiryMonth: pm.card?.exp_month || 0,
        expiryYear: pm.card?.exp_year || 0,
        id: pm.id,
        isDefault: pm.metadata?.isDefault || false,
        last4: pm.card?.last4 || '****',
      }));
    } catch (error) {
      logger.warn('[PAYMENT_METHOD_WORKFLOW] Error getting payment methods', { error, userId: user.id });
      return [];
    }
  }

  public static async deletePaymentMethod(paymentMethodId: string, user: User) {
    try {
      const deleted = await StripeService.deletePaymentMethod(paymentMethodId);
      if (!deleted) {
        throw new ApolloError('Failed to delete payment method');
      }
      return true;
    } catch (error) {
      logger.error('[PAYMENT_METHOD_WORKFLOW] Error deleting payment method', {
        error,
        paymentMethodId,
        userId: user.id,
      });
      throw new ApolloError('Failed to delete payment method');
    }
  }
}

export default PaymentMethodWorkflow;
