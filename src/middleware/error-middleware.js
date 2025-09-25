const errorMiddleware = (error, req, res, next) => {
    console.error('Erro:', error);
  
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
  
    if (error.code) {
      let message = 'Erro interno do servidor';
      let statusCode = 500;
  
      switch (error.code) {
        case '23505': 
          message = 'Dados já existem no sistema';
          statusCode = 409;
          break;
        case '23503': 
          message = 'Referência inválida';
          statusCode = 400;
          break;
        case '23514':
          message = 'Dados inválidos';
          statusCode = 400;
          break;
      }
  
      return res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
      });
    }
  
    if (error.message) {
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: error.toString() })
  });
};

module.exports = errorMiddleware;