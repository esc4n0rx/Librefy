const express = require('express');
const authRoutes = require('./auth-routes');
const subscriptionRoutes = require('./subscription-routes');

const router = express.Router();

// Definir versão da API
const API_VERSION = '/v1';

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Librefy API está funcionando',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Rotas de autenticação
router.use(`${API_VERSION}/auth`, authRoutes);

// Rotas de assinatura
router.use(`${API_VERSION}/subscription`, subscriptionRoutes);

// Rota 404 para endpoints não encontrados
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

module.exports = router;