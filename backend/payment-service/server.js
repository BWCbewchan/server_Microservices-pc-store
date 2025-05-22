const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = 4545;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const partnerCode = 'MOMO';

// Add health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'payment-service',
    timestamp: new Date().toISOString()
  });
});

// --- PAYMENT: từ POST body → GET query params ---
app.get('/payment', async (req, res) => {
  const { amount, orderInfo, orderId, requestId, extraData } = req.query;

<<<<<<< HEAD
  const redirectUrl = 'http://localhost:2000/home';
=======
  const redirectUrl = 'http://localhost:2000/home'|| `${process.env.FRONTEND_URL}/home`  ;
>>>>>>> 73751e4e587150575b8897c6bd75f0172af9e2f2
  const ipnUrl = 'https://6745-171-252-189-124.ngrok-free.app/callback';
  const requestType = "payWithMethod";
  const autoCapture = true;
  const lang = 'vi';

  // Tạo chữ ký HMAC SHA256
  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${orderId}` +
    `&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&partnerCode=${partnerCode}` +
    `&redirectUrl=${redirectUrl}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId,
    amount,
    orderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang,
    requestType,
    autoCapture,
    extraData: orderId,
    orderGroupId: '',
    signature
  };

  try {
    const result = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/create',
      requestBody,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('Error calling MoMo:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- CALLBACK từ MoMo ---
app.post('/callback', async (req, res) => {
  console.log('💫 Callback received from MoMo:', req.body);

  const {
    partnerCode, orderId, requestId, amount, orderInfo,
    orderType, transId, resultCode, message,
    payType, responseTime, extraData, signature
  } = req.body;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&amount=${amount}` +
    `&extraData=${extraData}` +
    `&message=${message}` +
    `&orderId=${orderId}` +
    `&orderInfo=${orderInfo}` +
    `&orderType=${orderType}` +
    `&partnerCode=${partnerCode}` +
    `&payType=${payType}` +
    `&requestId=${requestId}` +
    `&responseTime=${responseTime}` +
    `&resultCode=${resultCode}` +
    `&transId=${transId}`;

  const checkSignature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  if (signature !== checkSignature) {
    console.error('❌ Invalid signature');
    return res.status(400).json({ message: 'Invalid signature' });
  }

  if (resultCode === 0) {
    // thanh toán thành công → cập nhật order-service
    const updateData = JSON.stringify({
      'payment.status': 'paid',
      'status': 'confirmed'
    });
    try {
      const updateOrderResponse = await axios.put(
        `http://localhost:3000/api/orders/update/${extraData}/${encodeURIComponent(updateData)}`
      );
      console.log('✅ Order updated:', updateOrderResponse.data);
      return res.status(200).json({ message: 'Payment successful and order updated' });
    } catch (err) {
      console.error('❌ Update order failed:', err.message);
      return res.status(500).json({ error: 'Failed to update order status' });
    }
  } else {
    // thanh toán thất bại → set status pending
    const updateData = JSON.stringify({
      'payment.status': 'failed',
      'status': 'pending'
    });
    try {
      await axios.put(
        `http://localhost:3000/api/orders/update/${extraData}/${encodeURIComponent(updateData)}`
      );
      console.log('✅ Order set to failed');
    } catch (err) {
      console.error('❌ Cannot set failed status:', err.message);
    }
    return res.status(200).json({ message: 'Callback processed' });
  }
});

// --- QUERY TRANSACTION STATUS (giữ POST body nếu cần) ---
app.post('/transaction-status', async (req, res) => {
  const { orderId } = req.body;

  const rawSignature =
    `accessKey=${accessKey}` +
    `&orderId=${orderId}` +
    `&partnerCode=${partnerCode}` +
    `&requestId=${orderId}`;

  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = {
    partnerCode,
    requestId: orderId,
    orderId,
    signature,
    lang: 'vi',
  };

  try {
    const result = await axios.post(
      'https://test-payment.momo.vn/v2/gateway/api/query',
      requestBody,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('❌ Query status error:', error.message);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
