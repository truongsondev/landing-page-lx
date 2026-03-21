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

  async sendMemberRejectionEmail(data: {
    email: string;
    firstName: string;
    reason: string;
  }): Promise<void> {
    const subject = "Thông báo từ chối duyệt tài khoản Lưu Xá";
    const text = [
      `Xin chào ${data.firstName},`,
      "",
      "Tài khoản của bạn chưa được admin duyệt ở thời điểm hiện tại.",
      "Lý do từ chối:",
      data.reason,
      "",
      "Vui lòng liên hệ ban quản trị để được hỗ trợ thêm.",
    ].join("\n");

    const html = `
      <p>Xin chào <strong>${data.firstName}</strong>,</p>
      <p>Tài khoản của bạn chưa được admin duyệt ở thời điểm hiện tại.</p>
      <p><strong>Lý do từ chối:</strong></p>
      <blockquote>${data.reason}</blockquote>
      <p>Vui lòng liên hệ ban quản trị để được hỗ trợ thêm.</p>
    `;

    if (!this.transporter) {
      console.warn(
        "SMTP chưa được cấu hình. Không thể gửi email từ chối cho:",
        data.email,
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
