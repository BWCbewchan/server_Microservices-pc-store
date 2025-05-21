const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const axios = require('axios');

// MoMo API configuration (get these values from MoMo when you register)
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE;
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY;
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY;
const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const REDIRECT_URL = process.env.REDIRECT_URL || 'http://localhost:3000/order-confirmation';
const IPN_URL = process.env.IPN_URL || 'http://localhost:3000/api/payment/momo-callback';

router.post('/create-payment', async (req, res) => {
  try {
    const { orderId, amount, orderInfo } = req.body;
    
    // Create requestId
    const requestId = `${Date.now()}_${orderId}`;
    
    // Prepare the request to MoMo
    const rawSignature = `accessKey=${MOMO_ACCESS_KEY}&amount=${amount}&extraData=&ipnUrl=${IPN_URL}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_PARTNER_CODE}&redirectUrl=${REDIRECT_URL}&requestId=${requestId}&requestType=payWithMethod`;
    
    // Create signature
    const signature = crypto.createHmac('sha256', MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest('hex');
    
    // Request body
    const requestBody = {
      partnerCode: MOMO_PARTNER_CODE,
      accessKey: MOMO_ACCESS_KEY,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: REDIRECT_URL,
      ipnUrl: IPN_URL,
      extraData: "",
      requestType: "payWithMethod",
      signature: signature,
      lang: "vi"
    };
    
    // Send request to MoMo
    const response = await axios.post(MOMO_ENDPOINT, requestBody);
    
    // Return the payment URL to client
    res.json({
      success: true,
      payUrl: response.data.payUrl
    });
  } catch (error) {
    console.error('MoMo payment creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
