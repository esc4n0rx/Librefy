const { supabaseAdmin } = require('../config/database');

class PlanModel {
  
  async findAll() {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('price_monthly', { ascending: true });
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async findByName(name) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('name', name.toLowerCase())
      .eq('is_active', true)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async updateStripePriceId(planName, stripePriceId) {
    const { data, error } = await supabaseAdmin
      .from('plans')
      .update({ stripe_price_id: stripePriceId })
      .eq('name', planName.toLowerCase())
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }
}

module.exports = new PlanModel();