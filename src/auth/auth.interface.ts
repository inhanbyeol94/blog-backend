import { Member } from '@prisma/client';

export interface IToken {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenAndMemberId extends IToken {
  memberId: string;
}

export interface IEmailAuth {
  authCode: string;
  verify: boolean;
}

export interface IPayload extends Pick<Member, 'id' | 'nickname' | 'profileImage'> {}
