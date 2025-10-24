import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Send OTP for password reset
export const sendOtpMail = async (to, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Vingo <onboarding@resend.dev>',
      to: [to],
      subject: 'Reset Your Password - Vingo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #FF6B6B;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error(`❌ Error sending OTP mail to ${to}:`, error);
      throw error;
    }

    console.log(`✅ OTP mail sent successfully to ${to}`);
    return data;
  } catch (error) {
    console.error(`❌ Error sending OTP mail to ${to}:`, error);
    throw error;
  }
};

// Send delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Vingo <onboarding@resend.dev>',
      to: [user.email],
      subject: 'Your Delivery OTP - Vingo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Delivery Verification</h2>
          <p>Hello ${user.fullName},</p>
          <p>Your delivery verification OTP is:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">
            ${otp}
          </div>
          <p style="color: #666; font-size: 14px;">This OTP will expire in 5 minutes.</p>
          <p style="color: #999; font-size: 12px;">Please share this OTP with your delivery person.</p>
        </div>
      `,
    });

    if (error) {
      console.error(`❌ Error sending delivery OTP mail to ${user.email}:`, error);
      throw error;
    }

    console.log(`✅ Delivery OTP mail sent successfully to ${user.email}`);
    return data;
  } catch (error) {
    console.error(`❌ Error sending delivery OTP mail to ${user.email}:`, error);
    throw error;
  }
};
