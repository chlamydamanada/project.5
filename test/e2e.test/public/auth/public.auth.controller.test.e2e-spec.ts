import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';

describe('Testing auth public controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('REGISTRATION', () => {
    it('should register user with correct data: STATUS 204', async () => {
      await request(server).post('auth/registration').send({
        login: 'Bobby',
        password: '157523485254',
        email: 'bobby@mail.ru',
      });
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
