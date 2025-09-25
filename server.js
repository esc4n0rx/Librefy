const app = require('./src/app');
const env = require('./src/config/env');

const PORT = env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`
  ╭─────────────────────────────────────────────╮
  │                                             │
  │           LIBREFY API STARTED               │
  │                                             │
  │   Port: ${PORT.toString().padEnd(32)}       │
  │   Environment: ${env.NODE_ENV.padEnd(25)}   │
  │                                             │
  │                                             │
  │ Health : http://localhost:${PORT}/health    │
  │ API Base: http://localhost:${PORT}/v1       │
  │                                             │
  ╰─────────────────────────────────────────────╯
  `);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});