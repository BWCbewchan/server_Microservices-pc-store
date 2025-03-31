const Order = require('../models/order');
const { sendEmail } = require('../utils/emailService');

exports.updateTracking = async (req, res) => {
  try {
    const { orderId } = req.params;
    const trackingInfo = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    order.tracking.push(trackingInfo);
    await order.save();

    // Send email notification
    await sendEmail({
      to: order.userId.email,
      subject: 'Cập nhật trạng thái đơn hàng',
      template: 'tracking-update',
      data: { order, trackingInfo }
    });

    res.json(order.tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTrackingHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    res.json(order.tracking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};