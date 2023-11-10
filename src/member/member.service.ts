import { ForbiddenException, HttpException, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { MemberRepository } from './member.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IMessage } from '../_common/interfaces/result.interface';
import { responseMessageOnly } from '../_common/utils/serviceReturn';
import { IMember, IMembersForCaching } from './member.interface';
import { IEmailAuth } from '../auth/auth.interface';
import { Member, memberPlatform } from '@prisma/client';
import { ReqCreateDefaultMemberDto, ReqSocialMemberDto } from './member.dto';
import { memberMessage } from './member.message';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService implements OnModuleInit {
  private readonly logger = new Logger(MemberService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly memberRepository: MemberRepository,
  ) {}

  async onModuleInit(): Promise<void> {
    const findAllMemberForCaching: IMembersForCaching[] = await this.memberRepository.findAllMemberForCaching();

    // 이메일 캐싱
    const cachingEmails = findAllMemberForCaching.map((info) => info.email);
    await this.cacheManager.set('emails', cachingEmails || [], 0);
    this.logger.log('전체 사용자 이메일 캐싱 작업이 완료되었습니다.');

    // 태그 캐싱
    const cachingTagMembers = findAllMemberForCaching.map((info) => {
      return { id: info.id, profileImage: info.profileImage, nickname: info.nickname };
    });
    await this.cacheManager.set('tagMembers', cachingTagMembers || [], 0);
    this.logger.log('전체 사용자 태그 캐싱 작업이 완료되었습니다.');
  }

  /* 일반 회원가입 */
  async createDefaultMember(data: ReqCreateDefaultMemberDto): Promise<IMessage> {
    const emailAuth: IEmailAuth = await this.cacheManager.get(data.email);
    if (!emailAuth || !emailAuth.verify) throw new ForbiddenException(memberMessage.fail.emailAuthVerify);

    const findByUniqueDefaultEmail = await this.memberRepository.findByUniqueDefaultEmail(data.email);
    if (findByUniqueDefaultEmail) throw new ForbiddenException(memberMessage.fail.emailExist);

    data.password = await this.hashPassword(data.password);
    data.platform = memberPlatform.DEFAULT;

    const save = await this.memberRepository.createDefaultMember(data);

    await this.cacheManager.del(data.email);
    await this.addCacheData(save);

    return responseMessageOnly(memberMessage.success.createMember);
  }

  /* 소셜 회원가입 */
  async createSocialMember(data: ReqSocialMemberDto): Promise<IMember> {
    const save = await this.memberRepository.createSocialMember(data);
    await this.addCacheData(save);
    return save;
  }

  /* 소셜 아이디 조회 */
  async findUniqueBySocialid(socialId: string, platform: memberPlatform): Promise<IMember> {
    return await this.memberRepository.findByUniqueSocialId(socialId, platform);
  }

  /* 캐시 이메일 중복 검사 */
  async verifyExistEmail(email: string): Promise<IMessage> {
    const findCacheEmails: string[] = await this.cacheManager.get('emails');
    if (findCacheEmails.includes(email)) throw new HttpException(memberMessage.fail.emailExist, 412);
    return responseMessageOnly(memberMessage.success.emailExist);
  }

  /* 캐시 데이터 추가 */
  async addCacheData(data: Member): Promise<void> {
    if (data.platform == memberPlatform.DEFAULT) {
      const emails: string[] = await this.cacheManager.get('emails');
      emails.push(data.email);
      await this.cacheManager.set('emails', emails, 0);
    }

    const tags: { id: string; profileImage: string; nickname: string }[] = (await this.cacheManager.get('tags')) || [];
    tags.push({ id: data.id, profileImage: data.profileImage, nickname: data.nickname });
    await this.cacheManager.set('tags', tags, 0);
  }

  /* 패스워드 암호화 */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  /* 패스워드 일치 검사 */
  async comparePassword(requestPassword: string, password: string): Promise<boolean> {
    return await bcrypt.compare(requestPassword, password);
  }
}
