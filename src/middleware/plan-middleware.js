const subscriptionService = require('../services/subscription-service');

const requireFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const hasAccess = await subscriptionService.hasFeatureAccess(userId, featureName);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Recurso disponível apenas para assinantes Premium',
          requiredFeature: featureName,
          upgradeRequired: true
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar plano do usuário'
      });
    }
  };
};

const requirePremium = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await subscriptionService.getUserSubscription(userId);
    
    if (subscription.plan === 'free' || subscription.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Recurso disponível apenas para assinantes Premium',
        currentPlan: subscription.plan,
        upgradeRequired: true
      });
    }
    
    req.userPlan = subscription;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao verificar plano do usuário'
    });
  }
};

const checkUsageLimit = (featureName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const limit = await subscriptionService.getFeatureLimit(userId, featureName);
      
      req.featureLimit = limit;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar limite de uso'
      });
    }
  };
};

const attachPlanInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const subscription = await subscriptionService.getUserSubscription(userId);
    
    req.userPlan = subscription;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter informações do plano'
    });
  }
};

module.exports = {
  requireFeature,
  requirePremium,
  checkUsageLimit,
  attachPlanInfo
};