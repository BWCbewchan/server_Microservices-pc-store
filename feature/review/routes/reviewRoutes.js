const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticateToken, authorizeRole } = require('../../api-gateway/middleware/authMiddleware');

router.get('/:productId', reviewController.getReviewsByProduct);

// Authentication required to create a review
router.post('/', authenticateToken, reviewController.createReview);

// Example: Admin or the user who created the review can delete it
router.delete('/:id', authenticateToken, reviewController.deleteReview);

module.exports = router;
