const express = require('express');
const router = express.Router();
const ProductModel = require('../models/ProductModel');

// Get all products
router.get('/all-products', async (req, res) => {
  try {
    const products = await ProductModel.find();
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

module.exports = router;

