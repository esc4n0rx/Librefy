const express = require('express');
const authRoutes = require('./auth-routes');
const subscriptionRoutes = require('./subscription-routes');
const bookRoutes = require('./book-routes');
const libraryRoutes = require('./library-routes'); 
const commentRoutes = require('./comment-routes');
const ratingRoutes = require('./rating-routes');

const router = express.Router();

const API_VERSION = '/v1';

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Librefy API está funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

router.use(`${API_VERSION}/auth`, authRoutes);

router.use(`${API_VERSION}/subscription`, subscriptionRoutes);

router.use(`${API_VERSION}/books`, bookRoutes);

router.use(`${API_VERSION}/library`, libraryRoutes);

router.use(`${API_VERSION}/comments`, commentRoutes);
router.use(`${API_VERSION}/ratings`, ratingRoutes);

router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;