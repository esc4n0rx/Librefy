const Stripe = require('stripe');
const env = require('./env');

const stripe = Stripe(env.STRIPE_SECRET_KEY);

module.exports = {
  stripe,
  publishableKey: env.STRIPE_PUBLISHABLE_KEY,
  webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  premiumPriceId: env.STRIPE_PREMIUM_PRICE_ID
};