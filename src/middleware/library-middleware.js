const subscriptionService = require('../services/subscription-service');

const requirePlanLimit = (resource) => {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const deviceId = req.body.deviceId || req.query.deviceId;

      const userPlan = await subscriptionService.getUserSubscription(userId);
      
      let limit;
      switch (resource) {
        case 'offline_books':
          limit = userPlan.features.offline_library_limit || 3;
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Recurso não reconhecido para verificação de limite'
          });
      }

      let currentUsage = 0;
      if (resource === 'offline_books') {
        const libraryService = require('../services/library-service');
        currentUsage = await libraryService.countActiveOfflineLicenses(userId, deviceId);
      }

      if (currentUsage >= limit) {
        return res.status(403).json({
          success: false,
          message: 'Limite do plano excedido',
          error: {
            code: 'PLAN_LIMIT_EXCEEDED',
            resource: resource,
            limit: limit,
            current: currentUsage
          },
          upgradeRequired: userPlan.plan === 'free'
        });
      }

      req.userPlan = userPlan;
      req.planLimits = { [resource]: limit };
      req.currentUsage = { [resource]: currentUsage };

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar limites do plano'
      });
    }
  };
};

const attachPlanInfo = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userPlan = await subscriptionService.getUserSubscription(userId);
    
    req.userPlan = userPlan;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erro ao obter informações do plano'
    });
  }
};

module.exports = {
  requirePlanLimit,
  attachPlanInfo
};