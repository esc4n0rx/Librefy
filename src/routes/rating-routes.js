const express = require('express');
const ratingController = require('../controllers/rating-controller');
const authMiddleware = require('../middleware/auth-middleware');
const { validateBody, validateQuery } = require('../middleware/validation-middleware');
const { 
  rateBookSchema,
  getRatingsSchema
} = require('../utils/validation-schemas');

const router = express.Router();

router.get('/book/:bookId/stats', ratingController.getBookRatingStats);

router.use(authMiddleware);

router.post('/book/:bookId', validateBody(rateBookSchema), ratingController.rateBook);
router.delete('/book/:bookId', ratingController.removeRating);
router.get('/book/:bookId/my-rating', ratingController.getUserRating);
router.get('/my-ratings', validateQuery(getRatingsSchema), ratingController.getUserRatings);

module.exports = router;