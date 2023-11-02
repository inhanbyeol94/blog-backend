import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PickType } from '@nestjs/swagger';
import { memberPlatform } from '@prisma/client';
import { memberRegex } from './member.message';

/* Default */
export class ReqMemberDto {
  @IsNotEmpty()
  @IsString()
  @Matches(memberRegex.email)
  email: string;

  @IsNotEmpty()
  @IsString()
  @Matches(memberRegex.nickname)
  @MaxLength(25)
  @MinLength(1)
  nickname: string;

  @IsNotEmpty()
  @IsString()
  @Matches(memberRegex.phoneNumber)
  phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  @Matches(memberRegex.password)
  password: string;

  @IsOptional()
  @IsEnum(memberPlatform)
  platform: memberPlatform;

  @IsNotEmpty()
  @IsString()
  profileImage: string;

  @IsNotEmpty()
  @IsString()
  socialId: string;
}

// 일반 회원가입
export class ReqCreateDefaultMemberDto extends PickType(ReqMemberDto, ['email', 'password', 'nickname', 'phoneNumber', 'platform']) {}

// 소셜 회원가입
export class ReqSocialMemberDto extends PickType(ReqMemberDto, ['socialId', 'nickname', 'profileImage', 'platform']) {}
