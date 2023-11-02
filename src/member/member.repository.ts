import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IMember, IMembersForCaching } from './member.interface';
import { ReqCreateDefaultMemberDto, ReqSocialMemberDto } from './member.dto';
import { memberPlatform } from '@prisma/client';

@Injectable()
export class MemberRepository {
  constructor(private prisma: PrismaService) {}

  /* 일반 사용자 생성 */
  async createDefaultMember(data: ReqCreateDefaultMemberDto): Promise<IMember> {
    return await this.prisma.member.create({ data });
  }

  /* 소셜 사용자 생성 */
  async createSocialMember(data: ReqSocialMemberDto): Promise<IMember> {
    return await this.prisma.member.create({ data: { email: data.socialId, nickname: data.nickname, profileImage: data.profileImage, platform: data.platform } });
  }

  /* 일반 회원 이메일 조회 */
  async findByUniqueDefaultEmail(email: string): Promise<IMember> {
    return await this.prisma.member.findUnique({ where: { email, platform: memberPlatform.DEFAULT } });
  }

  /* 소셜 회원 아이디 조회 */
  async findByUniqueSocialId(socialId: string, platform: memberPlatform): Promise<IMember> {
    return await this.prisma.member.findUnique({ where: { email: socialId, platform } });
  }

  /* 캐싱 데이터 사용자 전체 조회 */
  async findAllMemberForCaching(): Promise<IMembersForCaching[]> {
    return this.prisma.member.findMany({ select: { id: true, email: true, nickname: true, profileImage: true } });
  }
}
