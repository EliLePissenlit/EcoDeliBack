import { ApolloError } from 'apollo-server-express';
import Stripe from 'stripe';
import {
  CancelSubscriptionInput,
  CreateCustomPaymentInput,
  CreateSubscriptionInput,
  User,
} from '../../types/graphql/typeDefs';
import UserService from '../../services/users';
import StripeService from '../../external-services/stripe';
import TransactionService from '../../services/transactions';
import TrxService from '../../services/trx';
import logger from '../../infrastructure/logger';
import errorCodes from '../../graphql/transactions/errorCodes';
import SlackService from '../../external-services/slack';
import { SLACK_CHANNELS } from '../../shared/slackChannels';

class TransactionWorkflow {
  public static async getTransaction(id: string) {
    return TransactionService.findById(id);
  }

  public static async getUserTransactions(userId: string) {
    return TransactionService.findUserTransactions(userId);
  }

  public static async getActiveSubscriptions(userId: string) {
    if (!userId) return [];
    return TransactionService.findActiveSubscriptions(userId);
  }

  public static async createCustomPayment(input: CreateCustomPaymentInput, user: User) {
    return TrxService.doInTransaction(async () => {
      const customer = await StripeService.getOrCreateCustomer(user.email);

      await UserService.save({
        id: user.id,
        input: {
          stripeCustomerId: customer.id,
        },
      });

      let couponData = {};
      if (input.couponCode) {
        try {
          const coupon = await StripeService.retrieveCouponByCode(input.couponCode);
          couponData = {
            discountAmountInCents: coupon.amount_off || null,
            discountPercentage: coupon.percent_off || null,
            stripeCouponId: coupon.id,
          };
        } catch (error) {
          throw new ApolloError(errorCodes.INVALID_COUPON_CODE);
        }
      }

      // Create payment intent with customer first
      const paymentIntent = await StripeService.createPaymentIntent(
        input.amount,
        customer.id,
        {
          ...input.metadata,
          ...couponData,
        },
        input.couponCode ?? undefined
      );

      if (paymentIntent.payment_method) {
        await StripeService.attachPaymentMethodToCustomer(paymentIntent.payment_method as string, customer.id);
      }

      const transaction = await TransactionService.createPaymentTransaction({
        amountInCents: input.amount,
        metadata: {
          ...input.metadata,
        },
        stripeCustomerId: customer.id,
        stripeIntentId: paymentIntent.id,
        stripePriceId: 'custom',
        userId: user.id,
        ...couponData,
      });

      return {
        clientSecret: paymentIntent.client_secret,
        intentId: paymentIntent.id,
        transaction,
      };
    });
  }

  public static async createSubscription(input: CreateSubscriptionInput, user: User) {
    return TrxService.doInTransaction(async (trx) => {
      try {
        const activeSubscriptions = await TransactionService.findActiveSubscriptions(user.id, trx);
        const hasSameSubscription = activeSubscriptions.some(
          (subscription) => subscription.stripePriceId === input.priceId
        );

        if (hasSameSubscription) {
          throw new ApolloError(
            'User already has an active subscription',
            errorCodes.USER_ALREADY_HAS_SAME_SUBSCRIPTION
          );
        }

        const customer = await StripeService.getOrCreateCustomer(user.email);
        const subscription = await StripeService.createSubscription(input.priceId, customer.id, input.metadata);
        const paymentIntent = (subscription.latest_invoice as Stripe.Invoice).payment_intent as Stripe.PaymentIntent;
        const invoiceId = (subscription.latest_invoice as Stripe.Invoice).id;

        const transaction = await TransactionService.createSubscriptionTransaction(
          {
            amountInCents: paymentIntent.amount,
            autoRenew: input.autoRenew ?? true,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            description: subscription.description ?? '',
            metadata: input.metadata,
            priceId: input.priceId,
            stripeCustomerId: customer.id,
            stripeIntentId: paymentIntent.id,
            stripeInvoiceId: invoiceId,
            stripePriceId: input.priceId,
            stripeSubscriptionId: subscription.id,
            userId: user.id,
          },
          trx
        );

        await UserService.save({
          id: user.id,
          input: {
            stripeCustomerId: customer.id,
          },
        });

        return {
          clientSecret: paymentIntent.client_secret,
          intentId: paymentIntent.id,
          transaction,
        };
      } catch (error) {
        logger.error('[TRANSACTION_WORKFLOW] Error creating subscription', { error, input });
        throw new ApolloError('Failed to create subscription', errorCodes.FAILED_TO_CREATE_SUBSCRIPTION);
      }
    });
  }

  public static async cancelSubscriptionByEmail({ email, immediately }: CancelSubscriptionInput) {
    const customer = await StripeService.getOrCreateCustomer(email);
    if (!customer) {
      return { message: 'Aucun client pour cet e-mail.', ok: false };
    }

    const subs = await StripeService.listSubscriptions(customer.id);
    const toCancel = subs.data.filter((s) => s.status === 'active' || s.status === 'trialing');

    if (toCancel.length === 0) {
      return { message: 'Aucun abonnement actif ou en essai.', ok: false };
    }

    await Promise.all(toCancel.map((sub) => StripeService.cancelSubscription(sub.id, immediately ?? false)));

    // Envoyer une notification Slack pour le désabonnement
    const blocks = [
      {
        text: {
          emoji: true,
          text: '🔔 Désabonnement effectué',
          type: 'plain_text',
        },
        type: 'header',
      },
      {
        text: {
          text: `*Utilisateur :* ${email}\n*Nombre d'abonnements annulés :* ${toCancel.length}\n*Type d'annulation :* ${
            immediately ? 'Immédiate' : 'À la fin de la période'
          }`,
          type: 'mrkdwn',
        },
        type: 'section',
      },
      {
        type: 'divider',
      },
    ];

    await SlackService.sendSlackMessageWithBlocks({
      blocks,
      channel: SLACK_CHANNELS.UNSUBSCRIBES,
    });

    return {
      message: immediately
        ? `Abonnement${toCancel.length > 1 ? 's' : ''} annulé${toCancel.length > 1 ? 's' : ''} immédiatement (${
            toCancel.length
          }).`
        : `Annulation programmée à la fin de la période pour ${toCancel.length} abonnement${
            toCancel.length > 1 ? 's' : ''
          }.`,
      ok: true,
    };
  }
}

export default TransactionWorkflow;
