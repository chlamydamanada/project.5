import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { authConstants } from './public.auth.constants';
import { DataSource } from 'typeorm';
import { delay } from '../../../delayFunction';

describe('Testing auth public controller', () => {
  let app: INestApplication;
  let server: any;
  let dataSource;
  beforeAll(async () => {
    //connection:
    app = await getApp();
    server = app.getHttpServer();
    //connecting to db:
    dataSource = await app.resolve(DataSource);
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('REGISTRATION user', () => {
    let token;
    it('shouldn`t register user with incorrect login: STATUS 400', async () => {
      const res = await request(server)
        .post('/auth/registration')
        .send(authConstants.invalid_user_login)
        .expect(400);

      expect(res.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'login',
          },
        ],
      });
    });
    it('shouldn`t register user with incorrect email: STATUS 400', async () => {
      const res = await request(server)
        .post('/auth/registration')
        .send(authConstants.invalid_user_email)
        .expect(400);

      expect(res.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'email',
          },
        ],
      });
    });
    it('shouldn`t register user with incorrect password: STATUS 400', async () => {
      const res = await request(server)
        .post('/auth/registration')
        .send(authConstants.invalid_user_password)
        .expect(400);

      expect(res.body).toEqual({
        errorsMessages: [
          {
            message: expect.any(String),
            field: 'password',
          },
        ],
      });
    });
    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('should login user and return access token in body and refresh token in cookie: STATUS 200 ', async () => {
      token = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(200);
    });

    it('refresh token', async () => {
      const accessToken = await request(server)
        .post('/auth/refresh-token')
        .set('Cookie', token.headers['set-cookie'])
        .expect(200);

      expect(accessToken.body).toEqual({
        accessToken: expect.any(String),
      });
    });
    it('should confirm email', async () => {
      //take confirmation code from db
      const code = await dataSource.query(
        `
SELECT  e."confirmationCode" FROM public."user" u
LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.user_1.email],
      );

      await request(server)
        .post('/auth/registration-confirmation')
        .send({ code: code[0].confirmationCode })
        .expect(204);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('REGISTRATION EMAIL RESENDING', () => {
    let code_1;
    let code_2;

    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('shouldn`t resending mail to incorrect email: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.invalid_email)
        .expect(400);
    });
    it('should resending email to correct email: STATUS 204', async () => {
      //take first confirmation code from db
      code_1 = await dataSource.query(
        `
SELECT  e."confirmationCode" FROM public."user" u
LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.user_1.email],
      );
      //change confirmation code
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);

      //take second confirmation code from db
      code_2 = await dataSource.query(
        `
SELECT  e."confirmationCode" FROM public."user" u
LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.email_1.email],
      );
    });
    it('shouldn`t be the same confirmation code_1 and  confirmation code_2', () => {
      expect(code_1[0].confirmationCode).not.toBe(code_2[0].confirmationCode);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('REGISTRATION-CONFIRMATION', () => {
    let code_1;
    let code_2;
    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await delay(9000);
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    }, 10000);

    it('should resending email to correct email: STATUS 204', async () => {
      //take first confirmation code from db
      code_1 = await dataSource.query(
        `
SELECT  e."confirmationCode" FROM public."user" u
LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.user_1.email],
      );
      //change confirmation code
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(204);

      //take second confirmation code from db
      code_2 = await dataSource.query(
        `
SELECT  e."confirmationCode" FROM public."user" u
LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.email_1.email],
      );
    });
    it('shouldn`t confirm email if code is incorrect: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send(authConstants.invalid_code_1)
        .expect(400);
    });
    it('shouldn`t confirm email by old confirmation code: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send({ code: code_1[0].confirmationCode })
        .expect(400);
    });
    it('should confirm email by old confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration-confirmation')
        .send({ code: code_2[0].confirmationCode })
        .expect(204);
    });
    it('shouldn`t resending mail if email is confirm: STATUS 400', async () => {
      await request(server)
        .post('/auth/registration-email-resending')
        .send(authConstants.email_1)
        .expect(400);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('LOGIN | ME | LOGOUT', () => {
    let token_1;
    let token_2;
    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('shouldn`t login user with incorrect loginOrEmail: STATUS 400', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.invalid_login_loginOrEmail)
        .expect(400);
    });
    it('shouldn`t login user with incorrect password: STATUS 400', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.invalid_login_password)
        .expect(400);
    });
    it('shouldn`t login user without authorization: STATUS 401', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_2)
        .expect(401);
    });
    it('should login user with correct data: STATUS 200', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(200);
    });
    it('should login user with correct data: STATUS 200', async () => {
      await delay(1000);
      token_2 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(200);
    });
    it('shouldn`t be the same first and second access tokens', () => {
      expect(token_1.body.accessToken).not.toBe(token_2.body.accessToken);
    });
    it('shouldn`t get information about the logged user without authorization: STATUS 401', async () => {
      await request(server).get('/auth/me').expect(401);
    });
    it('should get information about the logged user: STATUS 200', async () => {
      const res = await request(server)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);

      expect(res.body).toEqual({
        email: authConstants.user_1.email,
        login: authConstants.user_1.login,
        userId: expect.any(String),
      });
    });
    it('should get information about all devices of user: STATUS 200', async () => {
      const res = await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(res.body).toEqual([
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
        {
          ip: expect.any(String),
          title: expect.any(String),
          lastActiveDate: expect.any(String),
          deviceId: expect.any(String),
        },
      ]);
    });
    it('shouldn`t logout without authorization: STATUS 401', async () => {
      await request(server).post('/auth/logout').expect(401);
    });
    it('should logout user: STATUS 204', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(204);
    });
    it('shouldn`t get information about all devices of user: STATUS 401', async () => {
      await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(401);
    });
  });
  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('PASSWORD-RECOVERY | NEW-PASSWORD', () => {
    let recoveryCode;
    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('shouldn`t create recovery code and send mail to incorrect email: STATUS 400', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.invalid_email)
        .expect(400);
    });
    it('should create recovery code and send mail to user`s email: STATUS 204', async () => {
      await request(server)
        .post('/auth/password-recovery')
        .send(authConstants.email_1)
        .expect(204);

      recoveryCode = await dataSource.query(
        `
      SELECT  r."recoveryCode" FROM public."user" u
LEFT JOIN "password_recovery_info" r ON r."userId" = u."id"
WHERE u."login" = $1 AND u."email" = $2`,
        [authConstants.user_1.login, authConstants.email_1.email],
      );
    });
    it('shouldn`t confirm password recovery by incorrect recovery code: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send(authConstants.invalid_recovery_code)
        .expect(400);
    });
    it('shouldn`t confirm password recovery by incorrect new password: STATUS 400', async () => {
      await request(server)
        .post('/auth/new-password')
        .send({
          newPassword: 123456789,
          recoveryCode: recoveryCode[0].recoveryCode,
        })
        .expect(400);
    });
    it('should confirm password recovery : STATUS 204', async () => {
      await request(server)
        .post('/auth/new-password')
        .send({
          newPassword: '123456789',
          recoveryCode: recoveryCode[0].recoveryCode,
        })
        .expect(204);
    });
    it('shouldn`t login user with old password: STATUS 401', async () => {
      await delay(9000);
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(401);
    }, 10000);
    it('should login user with correct data: STATUS 200', async () => {
      await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.new_login_1)
        .expect(200);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('REFRESH-TOKEN', () => {
    let token_1;
    let token_2;

    it('should register user with correct data and send email with confirmation code: STATUS 204', async () => {
      await request(server)
        .post('/auth/registration')
        .send(authConstants.user_1)
        .expect(204);
    });
    it('should login user and return access token in body and refresh token in cookie: STATUS 200 ', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(authConstants.login_1)
        .expect(200);
    });

    it('shouldn`t generate new refresh and access tokens without authorization: STATUS 401', async () => {
      await request(server).post('/auth/refresh-token').expect(401);
    });

    it('should generate new refresh and access tokens', async () => {
      await delay(1000);
      token_2 = await request(server)
        .post('/auth/refresh-token')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(200);

      expect(token_2.body).toEqual({
        accessToken: expect.any(String),
      });
    });
    it('shouldn`t be the same first and second access tokens', () => {
      expect(token_2.body.accessToken).not.toBe(token_1.body.accessToken);
    });
    it('shouldn`t be the same first and second refresh tokens', () => {
      expect(token_2.headers['set-cookie'][0]).not.toBe(
        token_1.headers['set-cookie'][0],
      );
    });

    it('shouldn`t get information about all devices of user by old token: STATUS 401', async () => {
      await request(server)
        .get('/security/devices')
        .set('Cookie', token_1.headers['set-cookie'])
        .expect(401);
    });
    it('should get information about all devices of user by new token: STATUS 200', async () => {
      await request(server)
        .get('/security/devices')
        .set('Cookie', token_2.headers['set-cookie'])
        .expect(200);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
