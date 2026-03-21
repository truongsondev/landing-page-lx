export interface IEmailService {
  sendEmailVerification(data: {
    email: string;
    firstName: string;
    verificationLink: string;
  }): Promise<void>;

  sendMemberRejectionEmail(data: {
    email: string;
    firstName: string;
    reason: string;
  }): Promise<void>;
}
