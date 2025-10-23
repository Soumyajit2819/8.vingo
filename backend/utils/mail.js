import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter for Gmail with secure connection
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL, // vingofood580@gmail.com
    pass: process.env.PASS, // Gmail App Password (16 characters)
  },
});

// Send OTP for password reset
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "Reset Your Password - Vingo",
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
    console.log(`✅ OTP mail sent successfully to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending OTP mail to ${to}:`, error);
    throw error; // Re-throw to handle in route
  }
};

// Send delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Your Delivery OTP - Vingo",
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
    console.log(`✅ Delivery OTP mail sent successfully to ${user.email}`);
  } catch (error) {
    console.error(`❌ Error sending delivery OTP mail to ${user.email}:`, error);
    throw error; // Re-throw to handle in route
  }
};
