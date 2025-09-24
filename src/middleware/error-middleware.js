const errorMiddleware = (error, req, res, next) => {
    console.error('Erro:', error);
  
    // Erro de validação do Zod
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.errors
      });
    }
  
    // Erro do Supabase
    if (error.code) {
      let message = 'Erro interno do servidor';
      let statusCode = 500;
  
      switch (error.code) {
        case '23505': // Violação de unicidade
          message = 'Dados já existem no sistema';
          statusCode = 409;
          break;
        case '23503': // Violação de chave estrangeira
          message = 'Referência inválida';
          statusCode = 400;
          break;
        case '23514': // Violação de check constraint
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
  
    // Erro personalizado
    if (error.message) {
      const statusCode = error.statusCode || 400;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  
    // Erro genérico
  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { details: error.toString() })
  });
};

module.exports = errorMiddleware;