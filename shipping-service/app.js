// shipping-service/app.js
const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.json());

app.post('/shipments', (req, res) => {
  const { orderId, shippingAddress } = req.body;

  // TODO: Integrate with a real shipping provider (e.g., UPS, FedEx, USPS)
  // For now, simulate creating a shipment

  if (!orderId || !shippingAddress) {
    return res.status(400).json({ message: 'Thông tin giao hàng không hợp lệ' });
  }

  const trackingNumber = Math.random().toString(36).substring(2, 15); // Generate a random tracking number
  console.log(`Simulating creating shipment for order ${orderId} with tracking number ${trackingNumber}`);
  res.json({ success: true, message: 'Đơn hàng đang được giao', trackingNumber: trackingNumber });
});

const port = process.env.PORT || 3005;
app.listen(port, () => {
  console.log(`Shipping Service đang chạy trên cổng ${port}`);
});
