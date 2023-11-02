import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { IRequest } from '../../_common/interfaces/request.interface';
import { memberPlatform } from '@prisma/client';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
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
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?client_id=${this.configService.get('GOOGLE_CLIENT_ID')}&redirect_uri=${this.configService.get(
          'GOOGLE_CALLBACK_URL',
        )}&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&service=lso&o2v=2&theme=glif&flowName=GeneralOAuthFlow`,
      );
    } else {
      try {
        const oauthToken = await this.getOauthToken(code);
        const profile = await this.getProfile(oauthToken.data.access_token);

        if (!profile?.data) return false;

        const socialId = String(profile.data?.id) || null;
        const nickname = profile.data?.name || null;
        const profileImage = profile.data?.picture || null;

        if (!socialId || !nickname || !profileImage) return false;

        req.socialPayload = { socialId, nickname, profileImage, platform: memberPlatform.GOOGLE };

        return true;
      } catch (error) {
        return false;
      }
    }
  }

  async getOauthToken(code: string) {
    return await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        grant_type: 'authorization_code',
        client_id: this.configService.get('GOOGLE_CLIENT_ID'),
        redirect_uri: this.configService.get('GOOGLE_CALLBACK_URL'),
        client_secret: this.configService.get('GOOGLE_CLIENT_SECRET'),
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
    return await axios.get(`https://www.googleapis.com/userinfo/v2/me?access_token=${accessToken}`);
  }
}
