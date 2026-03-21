import nodemailer from "nodemailer";
import { IEmailService } from "@domain/services/IEmailService";

export class SMTPEmailService implements IEmailService {
  private transporter?: ReturnType<typeof nodemailer.createTransport>;
  private fromEmail: string;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    this.fromEmail =
      process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@localhost";

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
    }
  }

  async sendEmailVerification(data: {
    email: string;
    firstName: string;
    verificationLink: string;
  }): Promise<void> {
    const subject = "Xác thực email tài khoản Lưu Xá";
    const text = [
      `Xin chào ${data.firstName},`,
      "",
      "Cảm ơn bạn đã đăng ký tài khoản.",
      "Vui lòng nhấn vào liên kết bên dưới để xác thực email:",
      data.verificationLink,
      "",
      "Liên kết có hiệu lực trong 5 phút.",
    ].join("\n");

    const html = `
      <p>Xin chào <strong>${data.firstName}</strong>,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản.</p>
      <p>Vui lòng nhấn vào liên kết bên dưới để xác thực email:</p>
      <p><a href="${data.verificationLink}">Xác thực email</a></p>
      <p>Liên kết có hiệu lực trong 5 phút.</p>
    `;

    if (!this.transporter) {
      console.warn(
        "SMTP chưa được cấu hình. Liên kết xác thực:",
        data.verificationLink,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromEmail,
      to: data.email,
      subject,
      text,
      html,
    });
  }
}
