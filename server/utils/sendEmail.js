import nodemailer from "nodemailer";

const testAccount = await nodemailer.createTestAccount();

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "breanne.langworth20@ethereal.email",
    pass: "qmzjpFafnTcNmwVxc3",
  },
});

// Wrap in an async IIFE so we can use await.
export const sendEmail = async (to, subject, html) => {
  const info = await transporter.sendMail({
    from: `"Linky" <${testAccount.user}>`,
    to,
    subject,
    html,
  });

  let testUrl = nodemailer.getTestMessageUrl(info);
  console.log("Preview URL: ", testUrl);
};
