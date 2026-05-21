const nodemailer = require('nodemailer');
const dns = require('dns');
const { isInternalUser } = require('./internalAccounts');

// Force IPv4 to avoid Gmail IPv6 issues
dns.setDefaultResultOrder('ipv4first');

// Create transporter ONLY if credentials exist
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

const sendBehavioralEmail = async (to, subject, html) => {

  // Mock mode fallback
  if (!transporter) {
    console.warn(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return true;
  }

  // Skip internal users
  if (isInternalUser(to)) {
    console.log(`[Email Skipped] Internal account detected: ${to}`);
    return true;
  }

  try {

    // Verify SMTP connection before sending
    await transporter.verify();

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