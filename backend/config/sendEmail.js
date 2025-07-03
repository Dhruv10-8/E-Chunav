const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_HOST,
    pass: process.env.MAIL_PASS
  }
});

const sendVerificationEmail = async (email, token) => {
  const mailOptions = {
    from: process.env.MAIL_HOST,
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="http://localhost:8000/api/auth/verify-email?token=${token}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully.');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
}

module.exports = { transporter, sendVerificationEmail };
