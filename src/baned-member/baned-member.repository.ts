import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateBanedMemberDto } from './baned-member.dto';
import { BanedMember } from '@prisma/client';

@Injectable()
export class BanedMemberRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBanedMember(data: CreateBanedMemberDto): Promise<BanedMember> {
    return this.prisma.banedMember.create({ data });
  }

  async findBanedMember(memberId: string): Promise<BanedMember> {
    return this.prisma.banedMember.findFirst({ where: { memberId }, orderBy: { limitedAt: 'desc' } });
  }
}
