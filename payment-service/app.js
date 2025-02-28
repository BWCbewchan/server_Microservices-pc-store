// payment-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

app.post('/pay', (req, res) => {
  const { orderId, amount, paymentMethod, cardNumber, expiryDate, cvv } = req.body;

  // TODO: Integrate with a real payment gateway (Stripe, PayPal, etc.)
  // For now, simulate a successful payment
  console.log(`Simulating payment for order ${orderId} of ${amount} using ${paymentMethod}`);

  // Basic validation
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ message: 'Thông tin thanh toán không hợp lệ' });
  }

  // Simulate success
  const transactionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15); // Generate a random transaction ID
  res.json({ success: true, message: 'Thanh toán thành công', transactionId: transactionId });
});

const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`Payment Service đang chạy trên cổng ${port}`);
});
