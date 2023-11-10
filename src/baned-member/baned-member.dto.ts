import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { PickType } from '@nestjs/swagger';

export class ReqBanedMemberDto {
  @IsNotEmpty()
  @IsString()
  memberId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsNotEmpty()
  @IsDate()
  limitedAt: Date;
}

export class CreateBanedMemberDto extends PickType(ReqBanedMemberDto, ['memberId', 'reason', 'limitedAt']) {}
