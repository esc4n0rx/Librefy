const { supabaseAdmin } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  
  async createUser({ name, username, email, password, birth_date }) {
    const passwordHash = await bcrypt.hash(password, 12);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([{
        name,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password_hash: passwordHash,
        birth_date
      }])
      .select('id, name, username, email, birth_date, avatar_url, bio, status, created_at')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async findByUsername(username) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('username', username.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, name, username, email, birth_date, avatar_url, bio, status, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async updateUser(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, name, username, email, birth_date, avatar_url, bio, status, updated_at')
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async updatePassword(id, newPassword) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Métodos para códigos de recuperação
  async createPasswordResetCode(userId, code) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // Expira em 15 minutos
    
    const { data, error } = await supabaseAdmin
      .from('password_reset_codes')
      .insert([{
        user_id: userId,
        code,
        expires_at: expiresAt.toISOString()
      }])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  }

  async findValidResetCode(email, code) {
    const { data, error } = await supabaseAdmin
      .from('password_reset_codes')
      .select(`
        *,
        users!inner(id, email, name)
      `)
      .eq('code', code)
      .eq('users.email', email.toLowerCase())
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  }

  async markResetCodeAsUsed(codeId) {
    const { error } = await supabaseAdmin
      .from('password_reset_codes')
      .update({ used: true })
      .eq('id', codeId);
    
    if (error) {
      throw error;
    }
  }

  // Limpar códigos expirados (chamado periodicamente)
  async cleanExpiredResetCodes() {
    const { error } = await supabaseAdmin
      .from('password_reset_codes')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      throw error;
    }
  }
}

module.exports = new UserModel();