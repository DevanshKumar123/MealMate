import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()
console.log("MAIL CONFIG CHECK:", {
  EMAIL: process.env.EMAIL,
  HAS_APP_PASSWORD: !!process.env.EMAIL_APP_PASSWORD,
});


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});


export const sendOtpMail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: `"MealMate" <${process.env.EMAIL}>`,
      to,
      subject: "MealMate : Reset Your Password",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
  } catch (error) {
    console.error("Send OTP Mail Error:", error);
    throw error;
  }
};

export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: `"MealMate" <${process.env.EMAIL}>`,
      to: user.email,
      subject: "MealMate : Delivery OTP",
      html: `<p>Your OTP for Delivery is <b>${otp}</b>. It expires in 5 minutes.</p>`,
    });
  } catch (error) {
    console.error("Send Delivery OTP Mail Error:", error);
    throw error;
  }
};
