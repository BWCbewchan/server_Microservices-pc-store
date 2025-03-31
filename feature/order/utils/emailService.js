const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const emailTemplates = {
  'tracking-update': (data) => ({
    subject: 'Cập nhật trạng thái đơn hàng',
    html: `<h1>Đơn hàng của bạn đã được cập nhật</h1>
           <p>Trạng thái mới: ${data.trackingInfo.status}</p>
           <p>Vị trí: ${data.trackingInfo.location}</p>`
  }),
  'return-request': (data) => ({
    subject: 'Yêu cầu trả hàng',
    html: `<h1>Yêu cầu trả hàng đã được tạo</h1>
           <p>Trạng thái: ${data.returnData.status}</p>`
  }),
  'refund-status': (data) => ({
    subject: 'Cập nhật trạng thái hoàn tiền',
    html: `<h1>Cập nhật hoàn tiền</h1>
           <p>Trạng thái: ${data.order.returnRequest.refundStatus}</p>
           <p>Số tiền: ${data.order.returnRequest.refundAmount}</p>`
  })
};

exports.sendEmail = async ({ to, template, data }) => {
  const emailContent = emailTemplates[template](data);
  
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: emailContent.subject,
    html: emailContent.html
  });
};