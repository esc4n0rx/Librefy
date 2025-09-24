const { stripe } = require('../config/stripe');
const planModel = require('../models/plan-model');
const subscriptionModel = require('../models/subscription-model');
const userModel = require('../models/user-model');

class SubscriptionService {

  async getPlans() {
    return await planModel.findAll();
  }

  async getUserSubscription(userId) {
    const currentPlan = await subscriptionModel.getUserCurrentPlan(userId);
    
    if (!currentPlan) {
      throw new Error('Usuário não encontrado');
    }

    return {
      plan: currentPlan.plan_name,
      features: currentPlan.plan_features,
      status: currentPlan.subscription_status,
      expiresAt: currentPlan.expires_at
    };
  }

  async createCheckoutSession(userId, planName) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const plan = await planModel.findByName(planName);
    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    if (plan.name === 'free') {
      throw new Error('Plano gratuito não requer pagamento');
    }

    if (!plan.stripe_price_id) {
      throw new Error('Plano não configurado para pagamento');
    }

    // Verificar se usuário já tem assinatura ativa
    const existingSubscription = await subscriptionModel.findByUserId(userId);
    if (existingSubscription && existingSubscription.status === 'active') {
      throw new Error('Usuário já possui assinatura ativa');
    }

    // Criar ou recuperar customer no Stripe
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id,
          username: user.username
        }
      });
    }

    // Criar sessão de checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.APP_URL || 'myapp://'}success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'myapp://'}cancel`,
      metadata: {
        userId: user.id,
        planId: plan.id,
        planName: plan.name
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: plan.id,
          planName: plan.name
        }
      }
    });

    return {
      sessionId: session.id,
      checkoutUrl: session.url
    };
  }

  async cancelSubscription(userId) {
    const subscription = await subscriptionModel.findByUserId(userId);
    if (!subscription) {
      throw new Error('Nenhuma assinatura encontrada');
    }

    if (subscription.status !== 'active') {
      throw new Error('Assinatura não está ativa');
    }

    // Cancelar no Stripe
    await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

    // Atualizar no banco
    await subscriptionModel.cancelSubscription(userId);

    return { message: 'Assinatura cancelada com sucesso' };
  }

  async handleWebhook(event) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this._handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await this._handlePaymentSucceeded(event.data.object);
        break;
      
      case 'invoice.payment_failed':
        await this._handlePaymentFailed(event.data.object);
        break;
      
      case 'customer.subscription.updated':
        await this._handleSubscriptionUpdated(event.data.object);
        break;
      
      case 'customer.subscription.deleted':
        await this._handleSubscriptionDeleted(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  async _handleCheckoutCompleted(session) {
    const userId = session.metadata.userId;
    const planId = session.metadata.planId;
    
    // Buscar a subscription do Stripe
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Criar assinatura no banco
    await subscriptionModel.create({
      user_id: userId,
      plan_id: planId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });
  }

  async _handlePaymentSucceeded(invoice) {
    if (invoice.subscription) {
      await subscriptionModel.updateSubscription(invoice.subscription, {
        status: 'active'
      });
    }
  }

  async _handlePaymentFailed(invoice) {
    if (invoice.subscription) {
      await subscriptionModel.updateSubscription(invoice.subscription, {
        status: 'past_due'
      });
    }
  }

  async _handleSubscriptionUpdated(subscription) {
    await subscriptionModel.updateSubscription(subscription.id, {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
    });
  }

  async _handleSubscriptionDeleted(subscription) {
    await subscriptionModel.updateSubscription(subscription.id, {
      status: 'canceled',
      canceled_at: new Date().toISOString()
    });
  }

  // Método para verificar se usuário tem acesso a uma feature
  async hasFeatureAccess(userId, featureName) {
    const userPlan = await subscriptionModel.getUserCurrentPlan(userId);
    
    if (!userPlan || !userPlan.plan_features) {
      return false;
    }

    return userPlan.plan_features[featureName] === true;
  }

  // Método para obter limite de uma feature
  async getFeatureLimit(userId, featureName) {
    const userPlan = await subscriptionModel.getUserCurrentPlan(userId);
    
    if (!userPlan || !userPlan.plan_features) {
      return 0;
    }

    return userPlan.plan_features[featureName] || 0;
  }
}

module.exports = new SubscriptionService();