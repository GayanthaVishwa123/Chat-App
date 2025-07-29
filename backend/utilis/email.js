import nodemailer from "nodemailer";

class EmailSender {
  constructor(user, subject = "", message = "") {
    this.user = user;
    this.to = user.email;
    this.subject = subject;
    this.message = message;
    this.from = `Gayantha Vishwajith <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Example: SendGrid configuration
      return nodemailer.createTransport({
        service: "SendGrid", // or "Mailgun", "Gmail", etc.
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    // Development: SMTP config (e.g., Mailtrap, local SMTP)
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendEmail({ subject, text, html }) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text,
      html,
    };

    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcomeEmail(confirmURL) {
    const subject = "Welcome to Chat App 🎉";
    const text = `Hi ${this.user.username},\n\nPlease confirm your email: ${confirmURL}`;
    const html = `
      <p>Hi <strong>${this.user.username}</strong>,</p>
      <p>Thank you for registering with <b>Chat App</b>! Please verify your email by clicking the link below:</p>
      <p><a href="${confirmURL}" style="color:#00a884;">👉 Click to Verify</a></p>
      <p>This link will expire in <b>10 minutes</b>.</p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <br />
      <p>Thanks,<br/>The Chat App Team</p>
    `;

    await this.sendEmail({ subject, text, html });
  }

  async sendPasswordReset(resetURL) {
    const subject = "Your password reset token (valid for 10 minutes)";
    const text = `Forgot your password? Click here to reset it: ${resetURL}`;
    const html = `
      <p>Hello <strong>${this.user.name}</strong>,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetURL}" style="color:#d93025;">🔐 Reset Password</a></p>
      <p><b>Note:</b> This link will expire in 10 minutes.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    await this.sendEmail({ subject, text, html });
  }
}

export default EmailSender;
