import express from 'express';
import stripeWebhooks from './stripe';

const router = express.Router();

router.use('/stripe', stripeWebhooks);

export default router;
