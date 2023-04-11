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
    it('should login user 6 after a pause of 10 seconds: STATUS 200', async () => {
      await delay(9000);
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_6)
        .expect(200);
    }, 10000);
  });

  describe('Throttle of registration-confirmation', () => {
    it('shouldn`t confirm 1 email by invalid code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm 2 email by invalid code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm 3 email by invalid code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm 4 email by invalid code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm 5 email by invalid code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm 6 email (should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(429);
    });
    it('shouldn`t confirm 6 email after a pause of 10 seconds: STATUS 400', async () => {
      await delay(9850);
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    }, 10500);
  });
  describe('Throttle of registration-email-resending', () => {
    it('should resending 1 mail: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should resending 2 mail: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should resending 3 mail: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should resending 4 mail: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should resending 5 mail: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('shouldn`t resending 6 mail(should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(429);
    });
    it('should resending 6 mail after a pause of 10 seconds: STATUS 204', async () => {
      await delay(9850);
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);
    }, 10500);
  });
  describe('Throttle of password-recovery', () => {
    it('should create recovery code 1: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should create recovery code 2: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should create recovery code 3: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should create recovery code 4: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('should create recovery code 5: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    });
    it('shouldn`t create recovery code 6(should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(429);
    });
    it('should create recovery code 6 after a pause of 10 seconds: STATUS 204', async () => {
      await delay(9800);
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);
    }, 10500);
  });
  describe('Throttle of new-password', () => {
    it('shouldn`t create new password 1: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t create new password 2: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t create new password 3: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t create new password 4: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t create new password 5: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t create new password 6 (should be error too many requests): STATUS 429', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(429);
    });
    it('shouldn`t create new password 6 after a pause of 10 seconds: STATUS 400', async () => {
      await delay(9800);
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    }, 10500);
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
