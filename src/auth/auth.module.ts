import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SmsService } from '../sms/sms.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MemberModule } from '../member/member.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [JwtModule.register({ global: true }), MemberModule, MailModule],
  controllers: [AuthController],
  providers: [AuthService, SmsService],
})
export class AuthModule {}
