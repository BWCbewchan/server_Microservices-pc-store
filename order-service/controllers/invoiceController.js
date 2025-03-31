const Order = require('../models/order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate('userId')
      .populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const doc = new PDFDocument();
    const invoicePath = path.join(__dirname, `../invoices/${orderId}.pdf`);
    doc.pipe(fs.createWriteStream(invoicePath));

    // Add invoice content
    doc.fontSize(25).text('Hóa đơn', 100, 50);
    doc.fontSize(15).text(`Số hóa đơn: ${order.invoiceNumber}`, 100, 100);
    // ... Add more invoice details ...

    doc.end();

    order.invoiceUrl = `/invoices/${orderId}.pdf`;
    await order.save();

    res.json({ 
      message: 'Hóa đơn đã được tạo',
      invoiceUrl: order.invoiceUrl 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};