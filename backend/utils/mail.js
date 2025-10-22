import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMail = async (to, otp) => {
  try {
    await resend.emails.send({
      from: "Vingo <onboarding@resend.dev>", // works by default, no domain setup needed
      to,
      subject: "Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("OTP mail sent successfully ✅");
  } catch (error) {
    console.error("Error sending OTP mail:", error);
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await resend.emails.send({
      from: "Vingo <onboarding@resend.dev>",
      to: user.email,
      subject: "Delivery OTP",
      html: `<p>Your OTP for delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
    console.log("Delivery OTP mail sent successfully ✅");
  } catch (error) {
    console.error("Error sending delivery OTP mail:", error);
  }
};
