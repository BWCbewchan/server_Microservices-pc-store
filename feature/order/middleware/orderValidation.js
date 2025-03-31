// order-service/middleware/orderValidation.js
const { body, validationResult } = require('express-validator');

const validateOrder = [
  body('customer').notEmpty().withMessage('Tên khách hàng không được để trống').trim().escape(),
  body('items').isArray({ min: 1 }).withMessage('Đơn hàng phải có ít nhất một sản phẩm'),
  body('items.*').isMongoId().withMessage('ID sản phẩm không hợp lệ'),
  body('shippingAddress').notEmpty().withMessage('Địa chỉ giao hàng không được để trống').trim().escape(),
  body('billingAddress').notEmpty().withMessage('Địa chỉ thanh toán không được để trống').trim().escape(),
  body('paymentMethod').notEmpty().withMessage('Phương thức thanh toán không được để trống').trim().escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateOrder;
