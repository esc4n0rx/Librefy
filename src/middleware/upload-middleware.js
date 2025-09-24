const multer = require('multer');

// Configuração do multer para upload em memória
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Aceitar apenas imagens
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos de imagem são permitidos'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Middleware específico para upload de capa
const uploadBookCover = upload.single('cover');

// Middleware com tratamento de erro
const handleUploadError = (req, res, next) => {
  uploadBookCover(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Arquivo muito grande. Tamanho máximo: 5MB'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Erro no upload do arquivo'
        });
      }
      
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    next();
  });
};

module.exports = {
  upload,
  uploadBookCover: handleUploadError
};