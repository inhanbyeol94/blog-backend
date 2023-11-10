import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createAuthHistoryDto } from './auth-history.dto';
import { AuthHistory } from '@prisma/client';

@Injectable()
export class AuthHistoryRepository {
  constructor(private prisma: PrismaService) {}

  async createAuthHistory(data: createAuthHistoryDto): Promise<AuthHistory> {
    return this.prisma.authHistory.create({ data });
  }
}
