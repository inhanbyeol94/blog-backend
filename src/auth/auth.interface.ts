import { Member } from '@prisma/client';

export interface ISignToken {
  accessToken: string;
  refreshToken: string;
}

export interface IRefreshToken extends Pick<ISignToken, 'refreshToken'> {}

export interface IEmailAuth {
  authCode: string;
  verify: boolean;
}

export interface IPayload extends Pick<Member, 'id' | 'nickname' | 'profileImage'> {}
