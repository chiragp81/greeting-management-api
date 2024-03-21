import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MESSAGES, SHORT_MESSAGES } from './../../core/constants/messages';
import { User } from './../../core/interfaces/user.interface';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private readonly configService: ConfigService
  ) { }

  async sendUserConfirmationMail(user: User, token: string): Promise<void> {
    try {
      const confirmationLink = `${this.configService.get('URL')}/auth/verify-email/${token}`;

      await this.mailerService.sendMail({
        to: user.email,
        subject: MESSAGES.EMAIL_CONFIRMATION_REQUIRED_ATTENTION,
        template: './confirmation',
        context: {
          userName: user.userName,
          confirmationLink: confirmationLink
        },
      });
    } catch (error) {
      throw new HttpException({
        status: error?.status,
        error: error?.response?.error,
        message: error?.response?.message
      },
        error?.status);
    }
  }

  async sendUserWelcomeMail(user: User): Promise<void> {
    try {
      const url = `${this.configService.get('URL')}`;

      await this.mailerService.sendMail({
        to: user.email,
        subject: MESSAGES.WELCOME_TO_TODOS_APP,
        template: './welcome', // `.ejs` extension is appended automatically
        context: { // ✏️ filling curly brackets with content
          userName: user.userName,
          url,
        },
      });
    } catch (error) {
      throw new HttpException({
        status: error?.status,
        error: error?.response?.error,
        message: error?.response?.message
      },
        error?.status);
    }
  }

  async sendResetPasswordMail(user: User, resetToken: string): Promise<void> {
    try {
      const url = `${this.configService.get('URL')}/auth/reset-password/${resetToken}`;

      await this.mailerService.sendMail({
        to: user.email,
        from: `${SHORT_MESSAGES.SUPPORT_TEAM} <${this.configService.get<'SUPPORT_EMAIL'>}>`, // override default from
        subject: MESSAGES.TODO_RESET_YOUR_PASSWORD,
        template: './reset-password', // `.ejs` extension is appended automatically
        context: { // ✏️ filling curly brackets with content
          userName: user.userName,
          url,
        },
      });
    } catch (error) {
      throw new HttpException({
        status: error?.status,
        error: error?.response?.error,
        message: error?.response?.message
      },
        error?.status);
    }
  }
}
