const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error-middleware');
const env = require('./config/env');

const app = express();

// Middleware de segurança
app.use(helmet());

// CORS - configuração para mobile React Native
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081', // Expo development
    'exp://127.0.0.1:8081',
    // Adicione outros origins conforme necessário
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting básico (opcional - pode usar express-rate-limit para produção)
app.use((req, res, next) => {
  res.header('X-Powered-By', 'Librefy API');
  next();
});

// Rotas
app.use('/', routes);

// Middleware de tratamento de erro (deve ser o último)
app.use(errorMiddleware);

module.exports = app;