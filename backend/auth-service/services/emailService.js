const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'bewchan06@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'sidc idil qwxj zirp'
  }
});

// Send OTP email
exports.sendOtpEmail = async (email, otp) => {
  try {
    console.log(`Sending OTP email to ${email} with code: ${otp}`);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'bewchan06@gmail.com',
      to: email,
      subject: 'PC Store - Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">PC Store Verification</h2>
          <p>Hello,</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Thanks,<br>PC Store Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send verification success email
exports.sendVerificationSuccessEmail = async (email) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'bewchan06@gmail.com',
      to: email,
      subject: 'PC Store - Account Verified Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">Account Verified!</h2>
          <p>Hello,</p>
          <p>Your account has been successfully verified. You can now enjoy all the features of PC Store.</p>
          <p>Thanks for joining us!</p>
          <p>Best regards,<br>PC Store Team</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Success email sent: ' + info.response);
    return true;
  } catch (error) {
    console.error('Error sending verification success email:', error);
    throw error;
  }
};
