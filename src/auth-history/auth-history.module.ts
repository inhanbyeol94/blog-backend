import { Module } from '@nestjs/common';
import { AuthHistoryService } from './auth-history.service';
import { AuthHistoryRepository } from './auth-history.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AuthHistoryService, AuthHistoryRepository],
  exports: [AuthHistoryService, AuthHistoryRepository],
})
export class AuthHistoryModule {}
