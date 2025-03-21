const Review = require('../models/Review');
const cloudinary = require('../cloudinary');
const axios = require('axios');

exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;
    const userId = req.user.id;

    const images = req.files ? await Promise.all(
      req.files.map(file => cloudinary.uploader.upload(file.path))
    ) : [];

    const review = new Review({
      userId,
      productId,
      rating,
      comment,
      images: images.map(img => img.secure_url)
    });

    await review.save();

    // Update product rating
    await axios.post(`${process.env.PRODUCT_SERVICE_URL}/products/${productId}/update-rating`, {
      rating: rating
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({ productId })
      .populate('userId', 'profile.firstName profile.lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({ productId });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 