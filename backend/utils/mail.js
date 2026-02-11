import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpMail = async (to, otp) => {
  await resend.emails.send({
    from: "MealMate <onboarding@resend.dev>",
    to,
    subject: "MealMate : Reset Your Password",
    html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

export const sendDeliveryOtpMail = async (user, otp) => {
  await resend.emails.send({
    from: "MealMate <onboarding@resend.dev>",
    to: user.email,
    subject: "MealMate : Delivery OTP",
    html: `<p>Your OTP for Delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
  });
};

