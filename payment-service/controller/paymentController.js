const Payment = require('../models/Payment');
const axios = require('axios');

exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount, method } = req.body;

    let paymentDetails;
    switch (method) {
      case 'momo':
        paymentDetails = await createMomoPayment(amount);
        break;
      case 'vnpay':
        paymentDetails = await createVNPayPayment(amount);
        break;
      case 'paypal':
        paymentDetails = await createPayPalPayment(amount);
        break;
      default:
        return res.status(400).json({ message: 'Invalid payment method' });
    }

    const payment = new Payment({
      orderId,
      amount,
      method,
      paymentDetails
    });

    await payment.save();
    res.json({ 
      payment,
      redirectUrl: paymentDetails.redirectUrl 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = status;
    payment.transactionId = transactionId;
    await payment.save();

    // Notify order service about payment status
    await axios.post(`${process.env.ORDER_SERVICE_URL}/orders/${payment.orderId}/payment-status`, {
      status: payment.status
    });

    res.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 