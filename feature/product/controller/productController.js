const Product = require('../models/Product');
const cloudinary = require('../cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, category, brand, specifications } = req.body;
    const images = req.files ? await Promise.all(
      req.files.map(file => cloudinary.uploader.upload(file.path))
    ) : [];

    const product = new Product({
      name,
      price,
      description,
      category,
      brand,
      specifications,
      images: images.map(img => img.secure_url)
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, brand, minPrice, maxPrice } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = minPrice;
      if (maxPrice) query.price.$lte = maxPrice;
    }

    const products = await Product.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 