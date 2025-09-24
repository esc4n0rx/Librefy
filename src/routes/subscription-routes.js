const express = require('express');
const subscriptionController = require('../controllers/subscription-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { validateBody } = require('../middleware/validation-middleware');
const { createCheckoutSessionSchema } = require('../utils/validation-schemas');

const router = express.Router();

// Webhook do Stripe (sem autenticação)
router.post('/webhook', 
  express.raw({ type: 'application/json' }), 
  subscriptionController.handleWebhook
);

// Rotas públicas
router.get('/plans', subscriptionController.getPlans);

// Rotas protegidas (requer autenticação)
router.use(authMiddleware);

router.get('/my-subscription', subscriptionController.getUserSubscription);
router.post('/checkout', validateBody(createCheckoutSessionSchema), subscriptionController.createCheckoutSession);
router.delete('/cancel', subscriptionController.cancelSubscription);
router.get('/check-feature/:feature', subscriptionController.checkFeatureAccess);

module.exports = router;