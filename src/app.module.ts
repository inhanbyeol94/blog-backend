import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemberModule } from './member/member.module';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { SmsModule } from './sms/sms.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthHistoryModule } from './auth-history/auth-history.module';
import { BanedMemberModule } from './baned-member/baned-member.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `env/.env.${process.env.NODE_ENV}`,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {};
      },
    }),
    MemberModule,
    AuthModule,
    SwaggerModule,
    SmsModule,
    PrismaModule,
    MailModule,
    AuthHistoryModule,
    BanedMemberModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
