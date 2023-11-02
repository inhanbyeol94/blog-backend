import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('MemberController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  /* 일반 회원가입 */
  it('/member (POST)', () => {
    return request(app.getHttpServer())
      .post('/member')
      .send({ email: 'inhanbyeol94@gmail.com', nickname: '인한별', password: 'qwe123@@', phoneNumber: '010-1234-5678' })
      .expect(201);
  });
});
