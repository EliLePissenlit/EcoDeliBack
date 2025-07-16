import express, { json } from 'express';
import Stripe from 'stripe';
import config from 'config';
import TransactionService from '../../../../services/transactions';
import logger from '../../../logger';
import IS_DEV_ENVIRONNEMENT from '../../../../shared/isDevEnvironnement';
import getLogMetadata from '../../logger-plugin/getLogMetadata';
import StripeService from '../../../../external-services/stripe';

const router = express.Router();

const stripe = new Stripe(config.get('stripe.secretKey'), {
  apiVersion: '2025-01-27.acacia',
});

const stripeWebhooksApiKey = config.get('stripe.webhooksSecretKey');

router.use(
  json({
    limit: '15mb',
    verify(req: express.Request & { rawBody?: string }, res, buf) {
      req.rawBody = buf.toString();
    },
  })
);

router.use(async (req, res, next) => {
  logger.info('[STRIPE WEBHOOKS]', { ...getLogMetadata({ req }) });
  next();
});

const eventParser = (secret) => (req, res, next) => {
  try {
    if (IS_DEV_ENVIRONNEMENT) return next();
    req.body = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], secret);
  } catch (error) {
    logger.error('[STRIPE_WEBHOOK] Signature verification failed', { error });
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  return next();
};

router.post('/', eventParser(stripeWebhooksApiKey), async (req, res) => {
  try {
    const event = IS_DEV_ENVIRONNEMENT ? req.body : (req.body as Stripe.Event);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const transaction = await TransactionService.handlePaymentIntentSucceeded(paymentIntent.id);

        if (paymentIntent.payment_method && paymentIntent.customer && transaction) {
          await StripeService.attachPaymentMethodToCustomer(
            paymentIntent.payment_method as string,
            transaction.stripeCustomerId
          );
        }
        break;
      }

      case 'payment_intent.payment_failed':
        await TransactionService.handlePaymentIntentFailed((event.data.object as Stripe.PaymentIntent).id);
        break;

      case 'customer.subscription.created':
        await TransactionService.handleSubscriptionInitiated((event.data.object as Stripe.Subscription).id);
        break;

      case 'customer.subscription.updated':
        await TransactionService.handleSubscriptionUpdated((event.data.object as Stripe.Subscription).id);
        break;

      case 'customer.subscription.deleted':
        await TransactionService.handleSubscriptionDeleted((event.data.object as Stripe.Subscription).id);
        break;

      case 'invoice.payment_succeeded':
        await TransactionService.handleInvoiceCreated(event.data.object as Stripe.Invoice);
        break;

      default:
        logger.info(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return res.json({
      status: 'ok',
    });
  } catch (error) {
    logger.error('[STRIPE_WEBHOOK] Error processing webhook', { error });
    return res.status(500).send('Webhook processing failed');
  }
});

export default router;
