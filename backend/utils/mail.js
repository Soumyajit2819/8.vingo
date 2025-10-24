import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP for password reset (TEST MODE)
export const sendOtpMail = async (otp) => {
  const toEmail = 'soumyajitg28@gmail.com'; // your verified email for free testing
  try {
    const { data, error } = await resend.emails.send({
      from: 'Vingo <onboarding@resend.dev>', // required for free plan
      to: [toEmail],
      subject: 'Reset Your Password - TEST MODE',
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>It will expire in 5 minutes.</p>
      `,
    });

    if (error) throw error;
    console.log(`✅ OTP mail sent successfully to ${toEmail}`);
    return data;
  } catch (err) {
    console.error('❌ OTP send failed:', err);
    throw err;
  }
};

// Send delivery OTP (TEST MODE)
export const sendDeliveryOtpMail = async (otp) => {
  const toEmail = 'soumyajitg28@gmail.com'; // always send to your verified test email
  try {
    const { data, error } = await resend.emails.send({
      from: 'Vingo <onboarding@resend.dev>', // required for free plan
      to: [toEmail],
      subject: 'Delivery OTP - TEST MODE',
      html: `
        <h2>Delivery Verification</h2>
        <p>Your delivery OTP is: <b>${otp}</b></p>
        <p>It will expire in 5 minutes.</p>
      `,
    });

    if (error) throw error;
    console.log(`✅ Delivery OTP sent successfully to ${toEmail}`);
    return data;
  } catch (err) {
    console.error('❌ Delivery OTP send failed:', err);
    throw err;
  }
};
