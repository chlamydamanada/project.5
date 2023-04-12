import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { emailExamples } from './emailExamples';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendRegistrationEmail(
    confirmationCode: string,
    email: string,
  ): Promise<void> {
    try {
      const message = emailExamples.registrationEmail(confirmationCode);

      await this.mailerService.sendMail({
        to: email, //email of user
        // from: in module default from
        subject: 'Welcome! Confirm your Email', // Subject line
        html: message, // html body
      });

      return;
    } catch (e) {
      console.log(e);
    }
  }

  async sendPasswordRecoveryEmail(
    passwordRecoveryCode: string,
    email: string,
  ): Promise<void> {
    try {
      const message = emailExamples.passwordRecoveryEmail(passwordRecoveryCode);
      await this.mailerService.sendMail({
        to: email, //email of user
        // from: in module default from
        subject: 'Welcome! Confirm password recovery', // Subject line
        html: message, // html body
      });
      return;
    } catch (e) {
      console.log(e);
    }
  }
}
