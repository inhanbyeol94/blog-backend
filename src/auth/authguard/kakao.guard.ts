import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IRequest } from '../../_common/interfaces/request.interface';
import { memberPlatform } from '@prisma/client';

@Injectable()
export class KakaoAuthGuard implements CanActivate {
  constructor(private configService: ConfigService) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request: IRequest = context.switchToHttp().getRequest();
    const response: Response = context.switchToHttp().getResponse();
    return this.validateRequest(request, response);
  }

  async validateRequest(req: IRequest, res: Response): Promise<boolean> {
    const code = req.query.code as string;
    if (!code) {
      res.redirect(
        `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.configService.get('KAKAO_CLIENT_ID')}&redirect_uri=${this.configService.get(
          'KAKAO_CALLBACK_URL',
        )}`,
      );
    } else {
      try {
        const oauthToken = await this.getOauthToken(code);
        const profile = await this.getProfile(oauthToken.data.access_token);

        if (!profile?.data) return false;

        const socialId = String(profile.data?.id) || null;
        const nickname = profile.data.properties?.nickname || null;
        const profileImage = profile.data.properties?.profile_image || null;

        if (!socialId || !nickname || !profileImage) return false;

        req.socialPayload = { socialId, nickname, profileImage, platform: memberPlatform.KAKAO };

        return true;
      } catch (error) {
        return false;
      }
    }
  }

  async getOauthToken(code: string) {
    return await axios.post(
      'https://kauth.kakao.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: this.configService.get('KAKAO_CLIENT_ID'),
        redirect_uri: this.configService.get('KAKAO_CALLBACK_URL'),
        client_secret: this.configService.get('KAKAO_CLIENT_SECRET'),
        code,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          charset: 'UTF-8',
        },
      },
    );
  }

  async getProfile(accessToken: string) {
    return await axios.get('https://kapi.kakao.com/v2/user/me', { headers: { Authorization: 'Bearer ' + accessToken } });
  }
}
