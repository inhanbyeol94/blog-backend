import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { SmsService } from '../sms/sms.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { MemberRepository } from '../member/member.repository';
import { JwtService } from '@nestjs/jwt';
import { MemberService } from '../member/member.service';
import { IMessage } from '../_common/interfaces/result.interface';
import { responseMessageOnly } from '../_common/utils/serviceReturn';
import { MailService } from '../mail/mail.service';
import { ReqDefaultLoginDto, ReqSendEmailAuthCodeDto, ReqVerifyEmailAuthCodeDto } from './auth.dto';
import { authMessage } from './auth.message';
import { IEmailAuth, IPayload, ISignToken } from '../auth/auth.interface';
import { getReqIpCountry } from '../_common/utils/checkip';
import { ConfigService } from '@nestjs/config';
import { ReqSocialMemberDto } from '../member/member.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SmsService) private readonly smsService: SmsService,
    @Inject(MemberRepository) private readonly memberRepository: MemberRepository,
    @Inject(MemberService) private readonly memberService: MemberService,
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
  async defaultLogin(data: ReqDefaultLoginDto, ip: string): Promise<ISignToken> {
    const findMember = await this.memberRepository.findByUniqueDefaultEmail(data.email);

    if (!findMember) throw new ForbiddenException();
    if (!(await this.memberService.comparePassword(data.password, findMember.password))) throw new ForbiddenException();
    if (findMember.blackList) throw new ForbiddenException();
    if (!findMember.globalAccess) {
      const country = await getReqIpCountry(ip);
      if (country !== 'KR' && country !== 'none') throw new ForbiddenException();
    }
    const payload: IPayload = { id: findMember.id, nickname: findMember.nickname, profileImage: findMember.profileImage };

    return await this.createToken(payload);
  }

  /* 소셜 로그인 */
  async socialLogin(data: ReqSocialMemberDto, ip: string): Promise<ISignToken> {
    console.log(data.socialId);

    const findMember = await this.memberService.findUniqueBySocialid(data.socialId, data.platform);
    console.log(findMember);
    if (findMember) {
      if (findMember.blackList) throw new ForbiddenException();
      if (!findMember.globalAccess) {
        const country = await getReqIpCountry(ip);
        if (country !== 'KR' && country !== 'none') throw new ForbiddenException();
      }
      return await this.createToken(findMember);
    } else {
      const createMember = await this.memberService.createSocialMember(data);
      return await this.createToken(createMember);
    }
  }

  /* 토큰 발급 */
  async createToken(payload: IPayload): Promise<ISignToken> {
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
    return { accessToken, refreshToken };
  }
}
