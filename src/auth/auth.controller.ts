import { Body, Controller, Get, Ip, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IMessage } from '../_common/interfaces/result.interface';
import { ReqDefaultLoginDto, ReqSendEmailAuthCodeDto, ReqVerifyEmailAuthCodeDto } from './auth.dto';
import { KakaoAuthGuard } from './authguard/kakao.guard';
import { SocialPayload } from './auth.decorator';
import { ReqSocialMemberDto } from '../member/member.dto';
import { Request, Response } from 'express';
import { GoogleAuthGuard } from './authguard/google.guard';
import { NaverAuthGuard } from './authguard/naver.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /* 이메일 인증번호 발송 */
  @Post('email/authcode/send')
  async sendEmailAuthCode(@Body() data: ReqSendEmailAuthCodeDto): Promise<IMessage> {
    return await this.authService.sendEmailAuthCode(data);
  }

  /* 이메일 인증번호 검증 */
  @Post('email/authcode/verify')
  async verifyEmailAuthCode(@Body() data: ReqVerifyEmailAuthCodeDto): Promise<IMessage> {
    return await this.authService.verifyEmailAuthCode(data);
  }

  /* 일반 로그인 */
  @Post()
  async DefaultLogin(@Body() data: ReqDefaultLoginDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response): Promise<boolean> {
    const { accessToken, refreshToken } = await this.authService.defaultLogin(data, ip);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
    return true;
  }

  /* 카카오 로그인 */
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoLogin(@SocialPayload() data: ReqSocialMemberDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.socialLogin(data, ip);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.redirect('/');
  }

  /* 구글 로그인 */
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(@SocialPayload() data: ReqSocialMemberDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.socialLogin(data, ip);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.redirect('/');
  }

  /* 네이버 로그인 */
  @Get('naver')
  @UseGuards(NaverAuthGuard)
  async naverLogin(@SocialPayload() data: ReqSocialMemberDto, @Ip() ip: string, @Res({ passthrough: true }) res: Response): Promise<void> {
    const { accessToken, refreshToken } = await this.authService.socialLogin(data, ip);
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });

    return res.redirect('/');
  }
}
