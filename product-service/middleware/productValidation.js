// product-service/middleware/productValidation.js
const { body, validationResult } = require('express-validator');

const validateProduct = [
  body('name').notEmpty().withMessage('Tên sản phẩm không được để trống').trim().escape(),
  body('description').notEmpty().withMessage('Mô tả sản phẩm không được để trống').trim().escape(),
  body('price').isNumeric().withMessage('Giá sản phẩm phải là số').isFloat({ gt: 0 }).withMessage('Giá sản phẩm phải lớn hơn 0'),
  body('category').notEmpty().withMessage('Danh mục sản phẩm không được để trống').trim().escape(),
  body('imageUrl').optional().isURL().withMessage('URL hình ảnh không hợp lệ'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateProduct;
