const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
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
    fileSize: 5 * 1024 * 1024 
  }
});

const uploadBookCover = upload.single('cover');

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