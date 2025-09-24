const { supabaseAdmin } = require('../config/database');

class SubscriptionModel {
  
  async findByUserId(userId) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        plans (
          name,
          display_name,
          features,
          price_monthly
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        *,
        users (id, name, username, email),
        plans (name, display_name, features)
      `)
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async create(subscriptionData) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .insert([subscriptionData])
      .select(`
        *,
        plans (name, display_name, features, price_monthly)
      `)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async updateSubscription(subscriptionId, updates) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update(updates)
      .eq('stripe_subscription_id', subscriptionId)
      .select(`
        *,
        plans (name, display_name, features, price_monthly)
      `)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async cancelSubscription(userId) {
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        canceled_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async getUserCurrentPlan(userId) {
    const { data, error } = await supabaseAdmin
      .rpc('get_user_current_plan', { p_user_id: userId });
    
    if (error) {
      throw error;
    }
    
    return data[0] || null;
  }

  // Limpar assinaturas expiradas (executar periodicamente)
  async cleanExpiredSubscriptions() {
    const { error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'inactive' })
      .lt('current_period_end', new Date().toISOString())
      .eq('status', 'active');
    
    if (error) {
      throw error;
    }
  }
}

module.exports = new SubscriptionModel();