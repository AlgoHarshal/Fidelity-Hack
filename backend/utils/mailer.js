const nodemailer = require('nodemailer');
const dns = require('dns');
const { isInternalUser } = require('./internalAccounts');

// Force IPv4 resolution to prevent ENETUNREACH errors with Gmail's IPv6 servers
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBehavioralEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return true;
  }

  if (isInternalUser(to)) {
    console.log(`[Email Skipped] Internal account detected: ${to}`);
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: `"IntentEdge" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    if (subject.includes("Setup is Almost Complete")) {
      console.log(`[Notifications] Checkout recovery email sent: ${info.messageId}`);
    } else {
      console.log(`Email sent: ${info.messageId}`);
    }
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

module.exports = { sendBehavioralEmail };
