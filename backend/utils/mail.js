import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,       // Your Gmail
    pass: process.env.PASS,        // Gmail App Password (NOT regular password)
  },
});

// Send delivery OTP
export const sendDeliveryOtpMail = async (user, otp) => {
  if (!user?.email) {
    console.error("sendDeliveryOtpMail: user email is missing", user);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Delivery OTP",
    text: `Hello ${user.fullName},\n\nYour OTP for delivery is ${otp}.\nIt will expire in 5 minutes.`,
    html: `<p>Hello ${user.fullName},</p>
           <p>Your OTP for delivery is <b>${otp}</b>.</p>
           <p>It will expire in 5 minutes.</p>`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Delivery OTP mail sent successfully to ${user.email} ✅`);
    console.log("Mail info:", info); // Logs Gmail server response
  } catch (error) {
    console.error(`Error sending delivery OTP mail to ${user.email}:`, error);
  }
};
