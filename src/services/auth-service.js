const userModel = require('../models/user-model');
const emailService = require('./email-service');
const { generateToken } = require('../utils/jwt-utils');

class AuthService {
  
  async register(userData) {
    const { name, username, email, password, birth_date } = userData;

    // Verificar se username já existe
    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) {
      throw new Error('Nome de usuário já está em uso');
    }

    // Verificar se email já existe
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) {
      throw new Error('Email já está cadastrado');
    }

    // Criar usuário
    const user = await userModel.createUser({
      name,
      username,
      email,
      password,
      birth_date
    });

    // Gerar token JWT
    const token = generateToken({ 
      userId: user.id, 
      username: user.username 
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        birth_date: user.birth_date,
        avatar_url: user.avatar_url,
        bio: user.bio,
        status: user.status,
        created_at: user.created_at
      },
      token
    };
  }

  async login(username, password) {
    // Buscar usuário
    const user = await userModel.findByUsername(username);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar se usuário não está banido
    if (user.is_banned) {
      throw new Error('Conta banida. Entre em contato com o suporte');
    }

    // Verificar senha
    const isValidPassword = await userModel.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    const token = generateToken({ 
      userId: user.id, 
      username: user.username 
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        birth_date: user.birth_date,
        avatar_url: user.avatar_url,
        bio: user.bio,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      token
    };
  }

  async forgotPassword(email) {
    // Buscar usuário pelo email
    const user = await userModel.findByEmail(email);
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return { message: 'Se o email existir, um código foi enviado' };
    }

    // Gerar código de 6 dígitos
    const code = Math.random().toString().slice(2, 8).padStart(6, '0');

    // Salvar código no banco
    await userModel.createPasswordResetCode(user.id, code);

    // Enviar email
    await emailService.sendPasswordResetCode(user.email, code, user.name);

    return { message: 'Código de recuperação enviado para seu email' };
  }

  async resetPassword(email, code, newPassword) {
    // Buscar código válido
    const resetCode = await userModel.findValidResetCode(email, code);
    if (!resetCode) {
      throw new Error('Código inválido ou expirado');
    }

    // Atualizar senha
    await userModel.updatePassword(resetCode.users.id, newPassword);

    // Marcar código como usado
    await userModel.markResetCodeAsUsed(resetCode.id);

    return { message: 'Senha alterada com sucesso' };
  }

  async getProfile(userId) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  async updateProfile(userId, updates) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    const updatedUser = await userModel.updateUser(userId, updates);
    return updatedUser;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar senha atual para verificação
    const fullUser = await userModel.findByUsername(user.username);
    
    // Verificar senha atual
    const isValidPassword = await userModel.verifyPassword(currentPassword, fullUser.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha atual incorreta');
    }

    // Atualizar senha
    await userModel.updatePassword(userId, newPassword);

    return { message: 'Senha alterada com sucesso' };
  }

  async changeEmail(userId, newEmail, password) {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verificar se o novo email já está em uso
    const existingEmail = await userModel.findByEmail(newEmail);
    if (existingEmail && existingEmail.id !== userId) {
      throw new Error('Este email já está em uso');
    }

    // Buscar senha para verificação
    const fullUser = await userModel.findByUsername(user.username);
    
    // Verificar senha
    const isValidPassword = await userModel.verifyPassword(password, fullUser.password_hash);
    if (!isValidPassword) {
      throw new Error('Senha incorreta');
    }

    // Atualizar email
    const updatedUser = await userModel.updateUser(userId, { email: newEmail.toLowerCase() });

    return updatedUser;
  }
}

module.exports = new AuthService();