import Model from '..';
import { Transaction, TransactionStatus } from '../../types/graphql/typeDefs';

export class TransactionModel extends Model implements Transaction {
  id!: string;

  userId!: string;

  stripeCustomerId!: string;

  stripePriceId!: string;

  priceId?: string;

  stripeIntentId?: string;

  stripeSubscriptionId?: string;

  stripeInvoiceId?: string;

  stripeCouponId?: string;

  discountAmountInCents?: number;

  discountPercentage?: number;

  amountInCents!: number;

  currency!: string;

  name?: string;

  description?: string;

  metadata?: Record<string, any>;

  status!: TransactionStatus;

  isSubscription!: boolean;

  autoRenew?: boolean;

  trialEnd?: string;

  currentPeriodStart?: string;

  currentPeriodEnd?: string;

  canceledAt?: string;

  paidAt?: string;

  createdAt!: string;

  updatedAt!: string;

  static get tableName(): string {
    return 'transactions';
  }

  $beforeInsert(): void {
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  $beforeUpdate(): void {
    this.updatedAt = new Date().toISOString();
  }
}
