import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.$use(async (params, next) => await this.softDelete(params, next));
  }

  async softDelete(params: Prisma.MiddlewareParams, next) {
    if (params.action == 'delete') {
      params.action = 'update';
      params.args['data'] = { deletedAt: new Date() };
    }
    if (params.action == 'deleteMany') {
      params.action = 'updateMany';
      if (params.args.data != undefined) {
        params.args.data['deletedAt'] = new Date();
      } else {
        params.args['data'] = { deletedAt: new Date() };
      }
    }

    return next(params);
  }
}
