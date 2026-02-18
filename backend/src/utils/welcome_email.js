import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
 
export const sendWelcomeEmail = async (to, name) => {
  console.log("got called");
  try {
    await transporter.sendMail({
      from: `"Taskify" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Welcome to Taskify 🎉",
      html: `
        <h2>Hello ${name},</h2>
        <p>Your account was successfully created.</p>
        <p>We're happy to have you onboard.</p>
      `,
    });

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Email failed:", err);
  }
};
