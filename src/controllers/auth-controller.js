const authService = require('../services/auth-service');

class AuthController {
  
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);
      
      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, code, new_password } = req.body;
      const result = await authService.resetPassword(email, code, new_password);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        message: 'Perfil obtido com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;
      const user = await authService.updateProfile(userId, updates);
      
      res.status(200).json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { current_password, new_password } = req.body;
      const result = await authService.changePassword(userId, current_password, new_password);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      next(error);
    }
  }

  async changeEmail(req, res, next) {
    try {
      const userId = req.user.id;
      const { new_email, password } = req.body;
      const user = await authService.changeEmail(userId, new_email, password);
      
      res.status(200).json({
        success: true,
        message: 'Email alterado com sucesso',
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para verificar se token é válido
  async verifyToken(req, res, next) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);
      
      res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            avatar_url: user.avatar_url
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Endpoint para logout (opcional - cliente pode apenas remover token)
  async logout(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();