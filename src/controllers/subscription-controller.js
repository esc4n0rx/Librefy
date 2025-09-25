const subscriptionService = require('../services/subscription-service');
const { stripe, webhookSecret } = require('../config/stripe');

class SubscriptionController {

  async getPlans(req, res, next) {
    try {
      const plans = await subscriptionService.getPlans();
      
      res.status(200).json({
        success: true,
        message: 'Planos obtidos com sucesso',
        data: plans
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserSubscription(req, res, next) {
    try {
      const userId = req.user.id;
      const subscription = await subscriptionService.getUserSubscription(userId);
      
      res.status(200).json({
        success: true,
        message: 'Assinatura obtida com sucesso',
        data: subscription
      });
    } catch (error) {
      next(error);
    }
  }

  async createCheckoutSession(req, res, next) {
    try {
      const userId = req.user.id;
      const { plan } = req.body;
      
      const session = await subscriptionService.createCheckoutSession(userId, plan);
      
      res.status(200).json({
        success: true,
        message: 'Sessão de checkout criada com sucesso',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await subscriptionService.cancelSubscription(userId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async handleWebhook(req, res, next) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      await subscriptionService.handleWebhook(event);
      
      res.status(200).json({
        success: true,
        message: 'Webhook processado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      next(error);
    }
  }

  async checkFeatureAccess(req, res, next) {
    try {
      const userId = req.user.id;
      const { feature } = req.params;
      
      const hasAccess = await subscriptionService.hasFeatureAccess(userId, feature);
      
      res.status(200).json({
        success: true,
        message: 'Verificação realizada com sucesso',
        data: {
          feature,
          hasAccess
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();