const Order = require('../models/order');
const { sendEmail } = require('../utils/emailService');

exports.createReturnRequest = async (req, res) => {
  try {
    const { orderId } = req.params;
    const returnData = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    order.returnRequest = returnData;
    await order.save();

    await sendEmail({
      to: order.userId.email,
      subject: 'Yêu cầu trả hàng đã được tạo',
      template: 'return-request',
      data: { order, returnData }
    });

    res.status(201).json(order.returnRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.processRefund = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, refundAmount } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    order.returnRequest.refundStatus = status;
    order.returnRequest.refundAmount = refundAmount;
    await order.save();

    await sendEmail({
      to: order.userId.email,
      subject: 'Cập nhật trạng thái hoàn tiền',
      template: 'refund-status',
      data: { order }
    });

    res.json(order.returnRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};