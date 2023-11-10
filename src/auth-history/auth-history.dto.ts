import { authHistoryAction } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IntersectionType, PickType } from '@nestjs/swagger';
import { ReqMemberDto } from '../member/member.dto';

/* default */
export class AuthHistoryDto {
  @IsNotEmpty()
  @IsString()
  ip: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  @IsEnum(authHistoryAction)
  action: authHistoryAction;

  @IsNotEmpty()
  @IsString()
  detail: string;
}

export class createAuthHistoryDto extends IntersectionType(PickType(AuthHistoryDto, ['ip', 'country', 'action', 'detail']), PickType(ReqMemberDto, ['memberId'])) {}
