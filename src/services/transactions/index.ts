import { Transaction } from 'objection';
import { ApolloError } from 'apollo-server-express';
import Stripe from 'stripe';
import { TransactionModel } from '../../db/model/TransactionModel';
import GenericService from '../@generic';
import { TransactionStatus, NotificationType } from '../../types/graphql/typeDefs';
import logger from '../../infrastructure/logger';
import NotificationService from '../notifications';
import StripeService from '../../external-services/stripe';
import FileService from '../files';

class TransactionService extends GenericService<TransactionModel> {
  constructor() {
    super(TransactionModel);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async findActiveSubscriptions(userId: string, trx?: Transaction): Promise<TransactionModel[]> {
    return this.initializeQuery()
      .where('isSubscription', true)
      .whereIn('status', [
        TransactionStatus.SubscriptionActive,
        TransactionStatus.Succeeded,
        TransactionStatus.SubscriptionInitiated,
      ])
      .where('userId', userId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async findUserTransactions(userId: string, trx?: Transaction): Promise<TransactionModel[]> {
    return this.initializeQuery().where('userId', userId).where('isSubscription', false).orderBy('createdAt', 'desc');
  }

  public async createPaymentTransaction(
    input: {
      userId: string;
      stripeCustomerId: string;
      stripePriceId: string;
      stripeIntentId?: string;
      amountInCents: number;
      metadata?: Record<string, any>;
      description?: string;
      isCustom?: boolean;
    },
    trx?: Transaction
  ): Promise<TransactionModel> {
    try {
      let price;
      let product;

      if (input.isCustom) {
        price = await StripeService.retrievePrice(input.stripePriceId);
        product = await StripeService.retrieveProduct(price.product as string);
      }

      return await this.save(
        {
          input: {
            ...input,
            currency: 'eur',
            description: product?.description || 'Custom Payment',
            isSubscription: false,
            name: product?.name || 'Custom Payment',
            status: TransactionStatus.Pending,
          },
        },
        trx
      );
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error creating payment transaction', { error, input });
      throw new ApolloError('Failed to create payment transaction');
    }
  }

  public async createSubscriptionTransaction(
    input: {
      userId: string;
      stripeCustomerId: string;
      stripePriceId: string;
      stripeSubscriptionId: string;
      stripeIntentId: string;
      amountInCents: number;
      stripeInvoiceId: string;
      priceId: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
      metadata?: Record<string, any>;
      description?: string;
      autoRenew?: boolean;
      trialEnd?: string;
    },
    trx?: Transaction
  ): Promise<TransactionModel> {
    try {
      const price = await StripeService.retrievePrice(input.stripePriceId);
      const product = await StripeService.retrieveProduct(price.product as string);

      return await this.save(
        {
          input: {
            ...input,
            autoRenew: input.autoRenew ?? true,
            currency: 'eur',
            description: product.description || undefined,
            isSubscription: true,
            name: product.name,
            status: TransactionStatus.SubscriptionInitiated,
          },
        },
        trx
      );
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error creating subscription transaction', { error, input });
      throw new ApolloError('Failed to create subscription transaction');
    }
  }

  public async updateTransactionStatus(
    id: string,
    status: TransactionStatus,
    additionalData: Partial<TransactionModel> = {},
    trx?: Transaction
  ): Promise<TransactionModel> {
    try {
      const transaction = await this.findOne({ id });

      if (!transaction) logger.error('[TRANSACTION_SERVICE] Transaction not found', { id });

      const skipStatuses = [
        TransactionStatus.SubscriptionInitiated,
        TransactionStatus.Pending,
        TransactionStatus.Processing,
      ];

      if (!skipStatuses.includes(status)) {
        await NotificationService.save({
          input: {
            title: `${status}`,
            type: NotificationType.TransactionStatusUpdated,
            userId: transaction.userId,
          },
        });
      }

      return await this.save(
        {
          id,
          input: {
            status,
            ...additionalData,
            ...(status === TransactionStatus.Succeeded && { paidAt: new Date().toISOString() }),
          },
        },
        trx
      );
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error updating transaction status', { error, id, status });
      throw new ApolloError('Failed to update transaction status');
    }
  }

  public async cancelSubscription(id: string, immediately: boolean, trx?: Transaction): Promise<TransactionModel> {
    try {
      return await this.save(
        {
          id,
          input: {
            autoRenew: false,
            canceledAt: new Date().toISOString(),
            status: immediately ? TransactionStatus.SubscriptionCanceled : TransactionStatus.SubscriptionExpired,
          },
        },
        trx
      );
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error canceling subscription', { error, id });
      throw new ApolloError('Failed to cancel subscription');
    }
  }

  public async handlePaymentIntentSucceeded(paymentIntentId: string): Promise<TransactionModel | null> {
    try {
      const transaction = await this.findOne({ stripeIntentId: paymentIntentId });

      if (!transaction) {
        logger.error('[TRANSACTION_SERVICE] Transaction not found', { paymentIntentId });
        return null;
      }

      await this.updateTransactionStatus(transaction.id, TransactionStatus.Succeeded, {
        paidAt: new Date().toISOString(),
      });

      return transaction;
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error handling payment intent succeeded', { error, paymentIntentId });
      throw error;
    }
  }

  public async handlePaymentIntentFailed(paymentIntentId: string): Promise<void> {
    const transaction = await this.findOne({ stripeIntentId: paymentIntentId });
    if (!transaction) return;

    await this.updateTransactionStatus(transaction.id, TransactionStatus.Failed);
  }

  public async handleSubscriptionUpdated(subscriptionId: string): Promise<void> {
    try {
      const subscription = await StripeService.retrieveSubscription(subscriptionId);
      const transaction = await this.findOne({ stripeSubscriptionId: subscriptionId });
      if (!transaction) return;

      await this.updateTransactionStatus(transaction.id, TransactionStatus.SubscriptionActive, {
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      });
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error handling subscription update', { error, subscriptionId });
      throw error;
    }
  }

  public async handleSubscriptionInitiated(subscriptionId: string): Promise<void> {
    const transaction = await this.findOne({ stripeSubscriptionId: subscriptionId });
    if (!transaction) return;

    await this.updateTransactionStatus(transaction.id, TransactionStatus.SubscriptionInitiated);
  }

  public async handleSubscriptionDeleted(subscriptionId: string): Promise<void> {
    const transaction = await this.findOne({ stripeSubscriptionId: subscriptionId });
    if (!transaction) return;

    await this.updateTransactionStatus(transaction.id, TransactionStatus.SubscriptionExpired, {
      autoRenew: false,
      canceledAt: new Date().toISOString(),
    });
  }

  public async handleInvoiceCreated(invoice: Stripe.Invoice): Promise<void> {
    try {
      if (invoice.payment_intent) {
        const transactions = await this.find({
          stripeIntentId: invoice.payment_intent as string,
        });

        await Promise.all(
          transactions.map(async (transaction) => {
            if (!transaction.stripeInvoiceId) {
              await this.save({
                id: transaction.id,
                input: {
                  stripeInvoiceId: invoice.id,
                },
              });
            }
          })
        );
        // eslint-disable-next-line @typescript-eslint/brace-style
      } else if (invoice.subscription) {
        const transaction = await this.findOne({
          stripeSubscriptionId: invoice.subscription as string,
        });

        if (transaction) {
          if (!transaction.stripeInvoiceId) {
            await this.save({
              id: transaction.id,
              input: {
                stripeInvoiceId: invoice.id,
              },
            });
          }
        }
      }

      if (invoice.invoice_pdf) {
        const transactions = await this.find({
          stripeInvoiceId: invoice.id,
        });

        await Promise.all(
          transactions.map(async (transaction) => {
            await FileService.uploadStripeInvoiceIntoUserInvoicesFolder(invoice, transaction.userId);
          })
        );
      }
    } catch (error) {
      logger.error('[TRANSACTION_SERVICE] Error handling invoice created', {
        error,
        invoiceId: invoice.id,
      });
      throw error;
    }
  }
}

export default new TransactionService();
