const express = require('express');
const libraryController = require('../controllers/library-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { requirePlanLimit, attachPlanInfo } = require('../middleware/library-middleware');
const { validateBody, validateQuery } = require('../middleware/validation-middleware');
const { 
  addToLibrarySchema,
  createOfflineLicenseSchema,
  renewOfflineLicenseSchema,
  libraryQuerySchema
} = require('../utils/validation-schemas');

const router = express.Router();

router.use(authMiddleware);

router.post('/', validateBody(addToLibrarySchema), libraryController.addToLibrary);

router.delete('/:bookId', libraryController.removeFromLibrary);

router.get('/', validateQuery(libraryQuerySchema), libraryController.getLibrary);

router.post(
  '/:bookId/offline',
  validateBody(createOfflineLicenseSchema),
  requirePlanLimit('offline_books'),
  libraryController.createOfflineLicense
);

router.delete(
  '/:bookId/offline',
  validateQuery(libraryQuerySchema),
  libraryController.revokeOfflineLicense
);

router.get(
  '/offline',
  validateQuery(libraryQuerySchema),
  libraryController.getOfflineLicenses
);

router.post(
  '/:bookId/offline/renew',
  validateBody(renewOfflineLicenseSchema),
  attachPlanInfo,
  libraryController.renewOfflineLicense
);


router.post('/admin/cleanup-expired', libraryController.cleanupExpired);

module.exports = router;