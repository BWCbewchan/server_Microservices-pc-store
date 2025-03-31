// review-service/controllers/reviewController.js
const Review = require('../models/review');

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ date: -1 }); // Sort by date descending
    res.json(reviews);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    // Basic validation
    if (!productId || !userId || !rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Đánh giá phải từ 1 đến 5 sao' });
    }

    const review = new Review({
      productId,
      userId,
      rating,
      comment
    });

    const newReview = await review.save();
    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi tạo đánh giá', error: err.message });
  }
};

// Optional: Delete Review (Only Admin or the User can delete)
exports.deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }

    // Authorization check
    if (req.user.role !== 'admin' && req.user.userId !== review.userId) { // Assuming `authenticateToken` middleware sets `req.user`
      return res.status(403).json({ message: 'Bạn không có quyền xóa đánh giá này' });
    }

    await Review.findByIdAndDelete(reviewId);
    res.json({ message: 'Đánh giá đã được xóa' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi xóa đánh giá', error: err.message });
  }
};
