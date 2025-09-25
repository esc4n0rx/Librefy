const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorMiddleware = require('./middleware/error-middleware');
const env = require('./config/env');

const app = express();

app.use(helmet());

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:8081', 
    'exp://127.0.0.1:8081',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.header('X-Powered-By', 'Librefy API');
  next();
});

app.use('/', routes);

app.use(errorMiddleware);

module.exports = app;