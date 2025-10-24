import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.sendgrid.net",
  port: 587,
  auth: {
    user: "apikey", // literal string
    pass: process.env.SENDGRID_API_KEY,
  },
});

export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: "your-email@example.com", // verified sender in SendGrid
      to,
      subject: "Reset Your Password",
      html: `<p>Hello,</p><p>Your OTP is <b>${otp}</b></p>`,
    });
    console.log(`OTP sent to ${to} ✅`);
  } catch (error) {
    console.error(`Error sending OTP:`, error);
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: "your-email@example.com", // same verified sender
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Hello ${user.fullName},</p><p>Your OTP is <b>${otp}</b></p>`,
    });
    console.log(`Delivery OTP sent to ${user.email} ✅`);
  } catch (error) {
    console.error(`Error sending delivery OTP:`, error);
  }
};
