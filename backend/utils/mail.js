import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,   // your Gmail
    pass: process.env.PASS,    // Gmail app password, NOT regular password
  },
});

// Send OTP for password reset
export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "Reset Your Password",
      html: `<p>Hello,</p>
             <p>Your OTP for password reset is <b>${otp}</b>.</p>
             <p>It will expire in 5 minutes.</p>`,
    });
    console.log(`OTP mail sent successfully to ${to} ✅`);
  } catch (error) {
    console.error(`Error sending OTP mail to ${to}:`, error);
  }
};

// Send delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Hello ${user.fullName},</p>
             <p>Your OTP for delivery is <b>${otp}</b>.</p>
             <p>It will expire in 5 minutes.</p>`,
    });
    console.log(`Delivery OTP mail sent successfully to ${user.email} ✅`);
  } catch (error) {
    console.error(`Error sending delivery OTP mail to ${user.email}:`, error);
  }
};
