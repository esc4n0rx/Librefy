const { verifyToken } = require('../utils/jwt-utils');
const userModel = require('../models/user-model');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso obrigatório'
      });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (user.is_banned) {
      return res.status(403).json({
        success: false,
        message: 'Conta banida'
      });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

module.exports = authMiddleware;