// 인증번호 발송 요청
import { ReqMemberDto } from '../member/member.dto';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ReqAuthDto {
  @IsNotEmpty()
  @IsString()
  authCode: string;
}

export class ReqSendEmailAuthCodeDto extends PickType(ReqMemberDto, ['email']) {}
export class ReqVerifyEmailAuthCodeDto extends IntersectionType(PickType(ReqMemberDto, ['email']), PickType(ReqAuthDto, ['authCode'])) {}
export class ReqDefaultLoginDto extends PickType(ReqMemberDto, ['email', 'password']) {}
