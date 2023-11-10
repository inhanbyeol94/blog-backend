import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MemberRepository } from '../member/member.repository';
import { JwtService } from '@nestjs/jwt';
import { MemberService } from '../member/member.service';
import { IMessage } from '../_common/interfaces/result.interface';
import { responseMessageOnly, responseTokenAndMemberId, responseTokenOnly } from '../_common/utils/serviceReturn';
import { MailService } from '../mail/mail.service';
import { ReqDefaultLoginDto, ReqSendEmailAuthCodeDto, ReqVerifyEmailAuthCodeDto } from './auth.dto';
import { authMessage } from './auth.message';
import { IEmailAuth, IPayload, IToken } from '../auth/auth.interface';
import { getReqIpCountry } from '../_common/utils/checkip';
import { ConfigService } from '@nestjs/config';
import { ReqSocialMemberDto } from '../member/member.dto';
import { IMember } from '../member/member.interface';
import { AuthHistoryService } from '../auth-history/auth-history.service';
import { authHistoryAction } from '@prisma/client';
import { BanedMemberService } from '../baned-member/baned-member.service';
import * as dayjs from 'dayjs';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SmsService) private readonly smsService: SmsService,
    @Inject(MemberRepository) private readonly memberRepository: MemberRepository,
    @Inject(MemberService) private readonly memberService: MemberService,
    @Inject(AuthHistoryService) private readonly authHistoryService: AuthHistoryService,
    @Inject(BanedMemberService) private readonly banedMemberSerivce: BanedMemberService,
    private configService: ConfigService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  /* 이메일 인증번호 발송 */
  async sendEmailAuthCode(data: ReqSendEmailAuthCodeDto): Promise<IMessage> {
    const authCode = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    await this.cacheManager.set(data.email, { authCode, verify: false }, 1000 * 60 * 10);
    await this.mailService.sendEmailAuthCode(data.email, authCode);
    return responseMessageOnly(authMessage.success.sendEmailAuthCode);
  }

  /* 이메일 인증번호 검증 */
  async verifyEmailAuthCode(data: ReqVerifyEmailAuthCodeDto) {
    const emailAuth: IEmailAuth = await this.cacheManager.get(data.email);
    if (!emailAuth || emailAuth.authCode !== data.authCode) throw new ForbiddenException(authMessage.fail.verifyAuthCacheExist);
    await this.cacheManager.set(data.email, { verify: true }, 1000 * 60 * 10);
    return responseMessageOnly(authMessage.success.verifyEmailAuth);
  }

  /* 일반 로그인 */
  async defaultLogin(data: ReqDefaultLoginDto, ip: string): Promise<IToken> {
    const country = await getReqIpCountry(ip);

    const findMember = await this.memberRepository.findByUniqueDefaultEmail(data.email);
    await this.verifyLogin(findMember, ip, true, country, data.password);
    const payload: IPayload = { id: findMember.id, nickname: findMember.nickname, profileImage: findMember.profileImage };
    const { accessToken, refreshToken } = await this.createToken(payload);

    await this.authHistoryService.createAuthHistory({ memberId: findMember.id, ip, country, action: authHistoryAction.LOGIN_SUCCESS, detail: authMessage.success.login });
    return responseTokenOnly(accessToken, refreshToken);
  }

  /* 소셜 로그인 */
  async socialLogin(data: ReqSocialMemberDto, ip: string): Promise<IToken> {
    const findMember = await this.memberService.findUniqueBySocialid(data.socialId, data.platform);
    const country = await getReqIpCountry(ip);

    if (findMember) {
      await this.verifyLogin(findMember, ip, false, country);
      const { accessToken, refreshToken } = await this.createToken(findMember);
      await this.authHistoryService.createAuthHistory({ memberId: findMember.id, ip, country, action: authHistoryAction.LOGIN_SUCCESS, detail: authMessage.success.login });
      return responseTokenAndMemberId(accessToken, refreshToken, findMember.id);
    }

    const createMember = await this.memberService.createSocialMember(data);
    await this.verifyLogin(createMember, ip, false, country);
    await this.authHistoryService.createAuthHistory({ memberId: createMember.id, ip, country, action: authHistoryAction.LOGIN_SUCCESS, detail: authMessage.success.login });
    const { accessToken, refreshToken } = await this.createToken(createMember);
    return responseTokenAndMemberId(accessToken, refreshToken, createMember.id);
  }

  /* 로그인 검증 */
  async verifyLogin(member: IMember, ip: string, defaultLogin: boolean, country: string, reqPassword?: string): Promise<void> {
    const banedMember = await this.banedMemberSerivce.findBanedMember(member.id);
    if (banedMember && banedMember.limitedAt > dayjs().toDate()) throw new ForbiddenException(authMessage.fail.countOutPassword);

    if (defaultLogin) {
      //이메일 체크
      if (!member) throw new ForbiddenException(authMessage.fail.findByEmail);
      await this.authHistoryService.createAuthHistory({ memberId: member.id, ip, country, action: authHistoryAction.LOGIN_REQUEST, detail: authMessage.success.requestLogin });
      //패스워드 체크
      if (!(await this.memberService.comparePassword(reqPassword, member.password))) {
        await this.authHistoryService.createAuthHistory({ memberId: member.id, ip, country, action: authHistoryAction.LOGIN_FAIL, detail: authMessage.fail.comparePassword });
        await this.passwordMisMatchValid(member.id, ip, country);
        throw new ForbiddenException(authMessage.fail.comparePassword);
      }
    } else {
      await this.authHistoryService.createAuthHistory({ memberId: member.id, ip, country, action: authHistoryAction.LOGIN_REQUEST, detail: authMessage.success.requestLogin });
    }

    //블랙리스트 체크
    if (member.blackList) {
      await this.authHistoryService.createAuthHistory({ memberId: member.id, ip, country, action: authHistoryAction.LOGIN_FAIL, detail: authMessage.fail.blackList });
      throw new ForbiddenException(authMessage.fail.blackList);
    }

    //해외로그인 체크
    if (!member.globalAccess && country !== 'KR') {
      await this.authHistoryService.createAuthHistory({ memberId: member.id, ip, country, action: authHistoryAction.LOGIN_FAIL, detail: authMessage.fail.globalAccess });
      throw new ForbiddenException(authMessage.fail.globalAccess);
    }
  }

  /* 패스워드 5회 불일치 검증 */
  async passwordMisMatchValid(id: string, ip: string, country: string) {
    const data: number = await this.cacheManager.get(`${id}VP`);
    if (data) {
      if (data == 4) {
        await this.banedMemberSerivce.createBanedMember({ memberId: id, reason: '패스워드 5회 불일치', limitedAt: dayjs().add(30, 'minute').toDate() });
        await this.authHistoryService.createAuthHistory({ memberId: id, ip, country, action: authHistoryAction.BAN, detail: authMessage.fail.globalAccess });
        await this.cacheManager.del(`${id}VP`);
      }
      await this.cacheManager.set(`${id}VP`, data + 1, 1000 * 60 * 30);
    } else {
      await this.cacheManager.set(`${id}VP`, 1, 1000 * 60 * 30);
    }
  }

  /* 토큰 발급 */
  async createToken(payload: IPayload): Promise<IToken> {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
      expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRESIN'),
    });
    const refreshToken = this.jwtService.sign(
      { id: payload.id },
      {
        secret: this.configService.get<string>('REFRESH_TOKEN_KEY'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRESIN'),
      },
    );
    return responseTokenOnly(accessToken, refreshToken);
  }
}
