import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { usersConstants } from './users.constants';

describe('Testing users by blogger controller', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('BAN OR UNBAN user by blogger', () => {
    let token_blogger;
    let blog;
    let user_1;
    let user_2;
    let token_1;
    let token_2;
    it('should create blogger: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(usersConstants.blogger)
        .expect(201);
    });
    it('should login blogger and return access token', async () => {
      token_blogger = await request(server)
        .post('/auth/login')
        .send(usersConstants.login_blogger)
        .expect(200);
    });
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      user_1 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(usersConstants.user_1)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(usersConstants.login_1)
        .expect(200);
    });
    it('should create user_2 with correct data by sa: STATUS 201', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(usersConstants.user_2)
        .expect(201);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(usersConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data: STATUS 201', async () => {
      blog = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send(usersConstants.valid_blog_1)
        .expect(201);
    });
    it('shouldn`t ban user without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: `${blog.body.id}`,
        })
        .expect(401);
    });
    it('shouldn`t ban user with incorrect ban status: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: 123456789,
          banReason: 'some reason to ban user',
          blogId: `${blog.body.id}`,
        })
        .expect(400);
    });
    it('shouldn`t ban user with incorrect ban reason: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: '                                      ',
          blogId: `${blog.body.id}`,
        })
        .expect(400);
    });
    it('shouldn`t ban user with incorrect blog id: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: true,
        })
        .expect(400);
    });
    it('shouldn`t ban user to blog which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: usersConstants.invalid_id,
        })
        .expect(404);
    });
    it('shouldn`t ban user which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/blogger/users/${usersConstants.invalid_id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: `${blog.body.id}`,
        })
        .expect(404);
    });
    it('shouldn`t ban user by other blogger which: STATUS 403', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: `${blog.body.id}`,
        })
        .expect(403);
    });
    it('should ban user: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason to ban user',
          blogId: `${blog.body.id}`,
        })
        .expect(204);
    });
    // it('should get array of banned users by blogger: STATUS 200', async () => {});
    it('should unban user: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/users/${user_1.body.id}/ban`)
        .set('Authorization', `Bearer ${token_blogger.body.accessToken}`)
        .send({
          isBanned: false,
          banReason: 'some reason to unban user',
          blogId: `${blog.body.id}`,
        })
        .expect(204);
    });
    // it('should get empty array of banned user by blogger: STATUS 200', async () => {});
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  // describe('GET all banned users for blog', () => {});

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
