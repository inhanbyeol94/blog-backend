import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MemberService } from './member.service';
import { IMessage } from '../_common/interfaces/result.interface';
import { ReqCreateDefaultMemberDto } from './member.dto';

@Controller('member')
export class MemberController {
  constructor(private memberService: MemberService) {}

  /* 일반 회원가입 */
  @Post()
  async createDefaultMember(@Body() data: ReqCreateDefaultMemberDto): Promise<IMessage> {
    return await this.memberService.createDefaultMember(data);
  }

  /* 이메일 중복 검사 */
  @Get('/verify/exist/email/:email')
  async verifyExistEmail(@Param('email') email: string): Promise<IMessage> {
    return await this.memberService.verifyExistEmail(email);
  }
}
