import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
 
export const sendEmail = async (to , subject , html) => {
  try {
    await transporter.sendMail({
      from: `"Taskify" <${process.env.EMAIL_USER}>`,
      to,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email failed:", err);
  }
};
