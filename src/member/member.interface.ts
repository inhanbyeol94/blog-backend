import { Member } from '@prisma/client';

export interface IMember extends Member {}
export interface IMembersForCaching extends Pick<Member, 'id' | 'email' | 'nickname' | 'profileImage'> {}

export interface IEmailAuth {
  authCode: string;
  verify: boolean;
}
