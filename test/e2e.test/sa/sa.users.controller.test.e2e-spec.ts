import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { HttpExceptionFilter } from '../../../exception.filter';
import { useContainer } from 'class-validator';
import { saUsersConstants } from './sa.users.constants';

describe('Testing sa users controller', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        //transformOptions: { enableImplicitConversion: true },
        stopAtFirstError: true,
        exceptionFactory: (errors) => {
          const result = errors.map((e) => ({
            message: Object.values(e.constraints!)[0],
            field: e.property,
          }));
          throw new BadRequestException(result);
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    server = app.getHttpServer();
    await app.init();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CREATE user with correct data by sa', () => {
    it('shouldn`t create user without authorization: STATUS 401', async () => {
      await request(server)
        .post('/sa/users')
        .send(saUsersConstants.validUser_1)
        .expect(401);
    });
    it('should create user with correct data by sa and return it: STATUS 204', async () => {
      const newUser = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_1)
        .expect(201);

      expect(newUser.body).toEqual({
        id: expect.any(String),
        login: saUsersConstants.validUser_1.login,
        email: saUsersConstants.validUser_1.email,
        createdAt: expect.any(String),
        banInfo: saUsersConstants.banInfo_default,
      });
    });
    it('shouldn`t create user twice with correct data by sa: STATUS 400', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_1)
        .expect(400);
    });
    it('shouldn`t create user with incorrect login: STATUS 400', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.invalidUser_login)
        .expect(400);
    });
    it('shouldn`t create user with incorrect email: STATUS 400', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.invalidUser_email)
        .expect(400);
    });
    it('shouldn`t create user with incorrect password: STATUS 400', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.invalidUser_password)
        .expect(400);
    });
  });
  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });
  describe('GET users by sa with pagination and sorting', () => {
    it('shouldn`t get users without authorization: STATUS 401', async () => {
      await request(server).get('/sa/users').expect(401);
    });
    it('should get empty array of users with default pagination and sorting: STATUS 200', async () => {
      const users = await request(server)
        .get('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(users.body).toEqual(saUsersConstants.users_default);
    });
    it('should create five users with correct data: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_1)
        .expect(201);

      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_2)
        .expect(201);

      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_3)
        .expect(201);

      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_4)
        .expect(201);

      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saUsersConstants.validUser_5)
        .expect(201);
    });
    it('should return array with 5 users and default pagination and sorting', async () => {
      const users = await request(server)
        .get('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 5,
        items: [
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_5.login,
            email: saUsersConstants.validUser_5.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_4.login,
            email: saUsersConstants.validUser_4.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_3.login,
            email: saUsersConstants.validUser_3.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_2.login,
            email: saUsersConstants.validUser_2.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_1.login,
            email: saUsersConstants.validUser_1.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
        ],
      });
    });
    it('should return array with 5 users and page number 2, page size 2 and default sorting', async () => {
      const users = await request(server)
        .get('/sa/users?pageSize=2&pageNumber=2')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(users.body).toEqual({
        pagesCount: 3,
        page: 2,
        pageSize: 2,
        totalCount: 5,
        items: [
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_3.login,
            email: saUsersConstants.validUser_3.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
          {
            id: expect.any(String),
            login: saUsersConstants.validUser_2.login,
            email: saUsersConstants.validUser_2.email,
            createdAt: expect.any(String),
            banInfo: saUsersConstants.banInfo_default,
          },
        ],
      });
    });
  });
});
