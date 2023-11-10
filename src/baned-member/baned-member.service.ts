import { Injectable } from '@nestjs/common';
import { BanedMemberRepository } from './baned-member.repository';
import { CreateBanedMemberDto } from './baned-member.dto';
import { BanedMember } from '@prisma/client';

@Injectable()
export class BanedMemberService {
  constructor(private banedMemberRepository: BanedMemberRepository) {}

  async createBanedMember(data: CreateBanedMemberDto): Promise<BanedMember> {
    return this.banedMemberRepository.createBanedMember(data);
  }

  async findBanedMember(memberId: string): Promise<BanedMember> {
    return this.banedMemberRepository.findBanedMember(memberId);
  }
}
