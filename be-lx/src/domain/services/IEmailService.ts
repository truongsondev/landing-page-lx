export interface IEmailService {
  sendEmailVerification(data: {
    email: string;
    firstName: string;
    verificationLink: string;
  }): Promise<void>;
}
