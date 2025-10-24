import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS
  },
});

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
