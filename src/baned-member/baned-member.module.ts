import { Module } from '@nestjs/common';
import { BanedMemberService } from './baned-member.service';
import { BanedMemberRepository } from './baned-member.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BanedMemberService, BanedMemberRepository],
  exports: [BanedMemberService, BanedMemberRepository],
})
export class BanedMemberModule {}
