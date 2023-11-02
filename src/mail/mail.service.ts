import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendEmailAuthCode(to: string, authCode: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject: '[Space Blog] 회원가입 인증번호입니다.',
        html: `요청하신 이메일 인증번호는 '${authCode}'입니다.`,
      });
    } catch (error) {
      console.log(error);
    }
  }
}
