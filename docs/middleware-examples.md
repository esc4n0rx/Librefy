# Exemplos de Uso dos Middlewares de Plano

## 1. Proteger rota apenas para Premium

```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth-middleware');
const { requirePremium } = require('../middleware/plan-middleware');
const bookController = require('../controllers/book-controller');

const router = express.Router();

router.get('/statistics',
  authMiddleware,
  requirePremium,
  bookController.getBookStatistics
);

module.exports = router;
```

---

## 2. Verificar feature específica

```javascript
const { requireFeature } = require('../middleware/plan-middleware');

// Apenas usuários com acesso a 'custom_covers' podem fazer upload
router.post('/upload-cover',
  authMiddleware,
  requireFeature('custom_covers'),
  bookController.uploadCustomCover
);
```

---

## 3. Verificar limite de uso

```javascript
const { checkUsageLimit } = require('../middleware/plan-middleware');

// Verificar limite da biblioteca offline
router.post('/add-to-offline-library',
  authMiddleware,
  checkUsageLimit('offline_library_limit'),
  async (req, res, next) => {
    try {
      const currentCount = await bookService.getOfflineLibraryCount(req.user.id);
      const limit = req.featureLimit;
      
      if (currentCount >= limit) {
        return res.status(403).json({
          success: false,
          message: `Limite de ${limit} livros offline atingido`,
          upgradeRequired: limit <= 3
        });
      }
      
      // Continuar com a lógica...
      next();
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 4. Usar informações do plano no controller

```javascript
const { attachPlanInfo } = require('../middleware/plan-middleware');

router.get('/dashboard',
  authMiddleware,
  attachPlanInfo,
  async (req, res, next) => {
    try {
      const userPlan = req.userPlan;
      
      const dashboardData = {
        user: req.user,
        plan: userPlan.plan,
        features: userPlan.features,
        // Customizar dashboard baseado no plano
        showAds: userPlan.features.ads_enabled,
        offlineLimit: userPlan.features.offline_library_limit,
        // ... outras informações
      };
      
      res.json({
        success: true,
        data: dashboardData
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## 5. Middleware personalizado para lógica complexa

```javascript
const customPlanCheck = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userPlan = await subscriptionService.getUserSubscription(userId);
    
    // Lógica personalizada baseada no plano
    if (userPlan.plan === 'free') {
      // Usuários free têm limitações específicas
      const todayUploads = await bookService.getTodayUploadsCount(userId);
      if (todayUploads >= 1) {
        return res.status(403).json({
          success: false,
          message: 'Usuários gratuitos podem publicar apenas 1 livro por dia',
          upgradeRequired: true
        });
      }
    }
    
    req.userPlan = userPlan;
    next();
  } catch (error) {
    next(error);
  }
};

router.post('/publish-book',
  authMiddleware,
  customPlanCheck,
  bookController.publishBook
);
```

---

## 6. Combinar múltiplos middlewares

```javascript
router.put('/book/:id/highlight',
  authMiddleware,                    // 1. Verificar autenticação
  requireFeature('book_highlight'),  // 2. Verificar se tem a feature
  attachPlanInfo,                    // 3. Adicionar info do plano
  bookController.highlightBook       // 4. Controller final
);
```
