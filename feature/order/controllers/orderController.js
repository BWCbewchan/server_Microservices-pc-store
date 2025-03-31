// order-service/controllers/orderController.js
const Order = require('../models/order');
const axios = require('axios');

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('items');
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  const { customer, items, shippingAddress, billingAddress, paymentMethod } = req.body;

  try {
    // 1. Validate items (check if products exist and have enough stock)
    // This requires communication with Product Service and Inventory Service
    const productValidationPromises = items.map(async (itemId) => {
        try {
            const productResponse = await axios.get(`http://product-service:3001/products/${itemId}`);
            const product = productResponse.data;
             // You might also want to call Inventory Service here to check stock
           return {valid: true};

        } catch (error) {
            console.error("Error validating product",itemId,error.message);
            return {valid: false, productId:itemId, message: "Product not found or out of stock."}; //Simplified

        }
    });

    const productValidations = await Promise.all(productValidationPromises);

    const invalidProducts = productValidations.filter(validation => !validation.valid);

    if(invalidProducts.length > 0){
         return res.status(400).json({message: "One or more products are invalid", errors:invalidProducts});
    }


    // 2. Calculate total amount (requires product prices from Product Service)
    let total = 0;
    for (const itemId of items) {
         const productResponse = await axios.get(`http://product-service:3001/products/${itemId}`);
         const product = productResponse.data;
         total += product.price; // Basic -  you'd likely want quantity
    }

    const order = new Order({
      customer,
      items,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
    });

    const newOrder = await order.save();
    res.status(201).json(newOrder);

    //  3.  Ideally, you would trigger Payment Service and Shipping Service asynchronously
    //  using a message queue (e.g., RabbitMQ, Kafka)



  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Lỗi tạo đơn hàng', error: err.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi cập nhật đơn hàng', error: err.message });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json({ message: 'Đơn hàng đã được xóa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi xóa đơn hàng', error: err.message });
  }
};
