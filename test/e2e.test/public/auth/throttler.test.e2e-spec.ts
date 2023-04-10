import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { authConstants } from './public.auth.constants';
import { delay } from '../../../delayFunction';

describe('Testing throttle', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('Throttle of registration', () => {
    it('should register user 1: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('should register user 2: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_2)
        .expect(204);
    });
    it('should register user 3: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_3)
        .expect(204);
    });
    it('should register user 4: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_4)
        .expect(204);
    });
    it('should register user 5: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_5)
        .expect(204);
    });
    it('shouldn`t register user 6 (should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_6)
        .expect(429);
    });
    it('should register user 6 after a pause of 10 seconds: STATUS 204', async () => {
      await delay(9000);
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_6)
        .expect(204);
    }, 10000);
  });
  describe('Throttle of login', () => {
    it('should login user 1: STATUS 200 ', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(200);
    });
    it('should login user 2: STATUS 200 ', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_2)
        .expect(200);
    });
    it('should login user 3: STATUS 200 ', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_3)
        .expect(200);
    });
    it('should login user 4: STATUS 200 ', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_4)
        .expect(200);
    });
    it('should login user 5: STATUS 200 ', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_5)
        .expect(200);
    });
    it('shouldn`t login user 6 (should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(429);
    });
    it('should login user after a pause of 10 seconds: STATUS 200', async () => {
      await delay(9000);
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_6)
        .expect(200);
    }, 10000);
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
