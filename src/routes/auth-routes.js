const express = require('express');
const authController = require('../controllers/auth-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { validateBody } = require('../middleware/validation-middleware');

const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema
} = require('../utils/validation-schemas');

const router = express.Router();

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login', validateBody(loginSchema), authController.login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);

router.use(authMiddleware);

router.get('/profile', authController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), authController.updateProfile);
router.put('/change-password', validateBody(changePasswordSchema), authController.changePassword);
router.put('/change-email', validateBody(changeEmailSchema), authController.changeEmail);
router.get('/verify-token', authController.verifyToken);
router.post('/logout', authController.logout);

module.exports = router;