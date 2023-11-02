import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IRequest } from '../_common/interfaces/request.interface';

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: IRequest = ctx.switchToHttp().getRequest();
  return request.user;
});

export const SocialPayload = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request: IRequest = ctx.switchToHttp().getRequest();
  return request.socialPayload;
});
