/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import Stripe from 'stripe';
import config from 'config';
import logger from '../../infrastructure/logger';

const stripe = new Stripe(config.get('stripe.secretKey'), {
  apiVersion: '2025-01-27.acacia',
});

class StripeService {
  public static async getOrCreateCustomer(email: string): Promise<Stripe.Customer> {
    try {
      const customers = await stripe.customers.list({ email });
      if (customers.data.length > 0) return customers.data[0];

      return stripe.customers.create({ email });
    } catch (error) {
      logger.error('[STRIPE] Error creating/getting customer', { email, error });
      throw error;
    }
  }

  public static async retrievePrice(priceId: string): Promise<Stripe.Price> {
    try {
      return await stripe.prices.retrieve(priceId);
    } catch (error) {
      logger.error('[STRIPE] Error retrieving price', { error, priceId });
      throw error;
    }
  }

  public static async retrieveCouponByCode(code: string): Promise<Stripe.Coupon> {
    try {
      const promotionCodes = await stripe.promotionCodes.list({
        active: true,
        code: code.toUpperCase(),
        limit: 1,
      });

      if (promotionCodes.data.length === 0) {
        throw new Error('Coupon not found');
      }

      const promotionCode = promotionCodes.data[0];
      const coupon = await stripe.coupons.retrieve(promotionCode.coupon.id);

      if (coupon.redeem_by && coupon.redeem_by < Math.floor(Date.now() / 1000)) {
        throw new Error('Coupon has expired');
      }

      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        throw new Error('Coupon has reached maximum redemptions');
      }

      return coupon;
    } catch (error) {
      logger.error('[STRIPE] Error retrieving coupon by code', { code, error });
      throw error;
    }
  }

  public static async createPaymentIntent(
    amount: number,
    customerId: string,
    metadata: Record<string, any> = {},
    couponCode?: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      let finalAmount = amount;

      if (couponCode) {
        const promotionCodes = await stripe.promotionCodes.list({
          active: true,
          code: couponCode.toUpperCase(),
          limit: 1,
        });

        if (promotionCodes.data.length > 0) {
          const coupon = await stripe.coupons.retrieve(promotionCodes.data[0].coupon.id);

          if (coupon.percent_off) {
            finalAmount = Math.round(amount * (1 - coupon.percent_off / 100));
          } else if (coupon.amount_off) {
            finalAmount = Math.max(0, amount - coupon.amount_off);
          }

          metadata.original_amount = amount;
          metadata.applied_coupon = couponCode;
          metadata.promotion_code_id = promotionCodes.data[0].id;
        }
      }

      const paymentIntentData: Stripe.PaymentIntentCreateParams = {
        amount: finalAmount,
        automatic_payment_methods: { enabled: true },
        currency: 'eur',
        customer: customerId,
        metadata,
      };

      return stripe.paymentIntents.create(paymentIntentData);
    } catch (error) {
      logger.error('[STRIPE] Error creating payment intent', { customerId, error });
      throw error;
    }
  }

  public static async createSubscription(
    priceId: string,
    customerId: string,
    metadata: Record<string, any> = {}
  ): Promise<Stripe.Subscription> {
    try {
      const subscriptionData: Stripe.SubscriptionCreateParams = {
        customer: customerId,
        expand: ['latest_invoice.payment_intent'],
        items: [{ price: priceId }],
        metadata,
        payment_behavior: 'default_incomplete',
      };

      return stripe.subscriptions.create(subscriptionData);
    } catch (error) {
      logger.error('[STRIPE] Error creating subscription', { customerId, error, priceId });
      throw error;
    }
  }

  public static async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      logger.error('[STRIPE] Error retrieving payment intent', { error, paymentIntentId });
      throw error;
    }
  }

  public static async retrieveSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error) {
      logger.error('[STRIPE] Error retrieving subscription', { error, subscriptionId });
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async cancelSubscription(subscriptionId: string, immediately = true): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return subscription;
    } catch (error) {
      logger.error('[STRIPE] Error canceling subscription', { error, subscriptionId });
      throw error;
    }
  }

  public static async getInvoice(invoiceId: string): Promise<string | null> {
    try {
      if (!invoiceId) return null;
      const invoice = await stripe.invoices.retrieve(invoiceId);
      return invoice.invoice_pdf || null;
    } catch (error) {
      logger.error('[STRIPE] Error retrieving invoice', { error, invoiceId });
      return null;
    }
  }

  public static async getUserPaymentMethods(customerId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error('[STRIPE] Error retrieving payment methods', { customerId, error });
      throw error;
    }
  }

  public static async deletePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      await stripe.paymentMethods.detach(paymentMethodId);
      return true;
    } catch (error) {
      logger.error('[STRIPE] Error deleting payment method', { error, paymentMethodId });
      return false;
    }
  }

  public static async retrieveProduct(productId: string): Promise<Stripe.Product> {
    try {
      return await stripe.products.retrieve(productId, {
        expand: ['default_price'],
      });
    } catch (error) {
      logger.error('[STRIPE] Error retrieving product', { error, productId });
      throw error;
    }
  }

  public static async getReceipt(paymentIntentId: string): Promise<string | null> {
    try {
      if (!paymentIntentId) return null;

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!paymentIntent.latest_charge) return null;

      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge as string);
      return charge?.receipt_url || null;
    } catch (error) {
      logger.error('[STRIPE] Error retrieving receipt', { error, paymentIntentId });
      return null;
    }
  }

  public static async listCoupons(): Promise<Stripe.ApiList<Stripe.Coupon>> {
    try {
      return await stripe.coupons.list();
    } catch (error) {
      logger.error('[STRIPE] Error listing coupons', { error });
      throw error;
    }
  }

  public static async retrieveCoupon(couponId: string): Promise<Stripe.Coupon> {
    try {
      return await stripe.coupons.retrieve(couponId);
    } catch (error) {
      logger.error('[STRIPE] Error retrieving coupon', { couponId, error });
      throw error;
    }
  }

  public static async createCoupon(couponData: Stripe.CouponCreateParams): Promise<Stripe.Coupon> {
    try {
      const coupon = await stripe.coupons.create(couponData);
      await stripe.promotionCodes.create({
        code: coupon.name!,
        coupon: coupon.id,
      });

      return coupon;
    } catch (error) {
      logger.error('[STRIPE] Error creating coupon', { couponData, error });
      throw error;
    }
  }

  public static async updateCoupon(couponId: string, updateData: Stripe.CouponUpdateParams): Promise<Stripe.Coupon> {
    try {
      return await stripe.coupons.update(couponId, updateData);
    } catch (error) {
      logger.error('[STRIPE] Error updating coupon', { couponId, error, updateData });
      throw error;
    }
  }

  public static async deleteCoupon(couponId: string): Promise<void> {
    try {
      await stripe.coupons.del(couponId);
    } catch (error) {
      logger.error('[STRIPE] Error deleting coupon', { couponId, error });
      throw error;
    }
  }

  public static async listProducts(): Promise<Stripe.ApiList<Stripe.Product>> {
    try {
      return await stripe.products.list({
        expand: ['data.default_price'],
      });
    } catch (error) {
      logger.error('[STRIPE] Error listing products', { error });
      throw error;
    }
  }

  public static async createProduct(productData: Stripe.ProductCreateParams): Promise<Stripe.Product> {
    try {
      return await stripe.products.create(productData);
    } catch (error) {
      logger.error('[STRIPE] Error creating product', { error, productData });
      throw error;
    }
  }

  public static async updateProduct(
    productId: string,
    updateData: Stripe.ProductUpdateParams
  ): Promise<Stripe.Product> {
    try {
      return await stripe.products.update(productId, updateData);
    } catch (error) {
      logger.error('[STRIPE] Error updating product', { error, productId, updateData });
      throw error;
    }
  }

  public static async deleteProduct(productId: string): Promise<void> {
    try {
      await stripe.products.del(productId);
    } catch (error) {
      logger.error('[STRIPE] Error deleting product', { error, productId });
      throw error;
    }
  }

  public static async listPrices(productId: string): Promise<Stripe.ApiList<Stripe.Price>> {
    try {
      return await stripe.prices.list({
        active: true,
        product: productId,
      });
    } catch (error) {
      logger.error('[STRIPE] Error listing prices', { error, productId });
      throw error;
    }
  }

  public static async createPrice(priceData: Stripe.PriceCreateParams): Promise<Stripe.Price> {
    try {
      const price = await stripe.prices.create(priceData);
      return price;
    } catch (error) {
      logger.error('[STRIPE] Error creating price', { error, priceData });
      throw error;
    }
  }

  public static async listLineItems(sessionId: string): Promise<Stripe.ApiList<Stripe.LineItem>> {
    try {
      return await stripe.checkout.sessions.listLineItems(sessionId);
    } catch (error) {
      logger.error('[STRIPE] Error listing line items', { error, sessionId });
      throw error;
    }
  }

  public static async listSubscriptions(customerId: string): Promise<Stripe.ApiList<Stripe.Subscription>> {
    try {
      return await stripe.subscriptions.list({
        customer: customerId,
      });
    } catch (error) {
      logger.error('[STRIPE] Error listing subscriptions', { customerId, error });
      throw error;
    }
  }

  public static async attachPaymentMethodToCustomer(
    paymentMethodId: string,
    customerId: string
  ): Promise<Stripe.PaymentMethod> {
    try {
      return await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    } catch (error) {
      logger.error('[STRIPE] Error attaching payment method to customer', { customerId, error, paymentMethodId });
      throw error;
    }
  }
}

export default StripeService;
