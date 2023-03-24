import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { blogsConstants } from './blogs.constants';

describe('Testing blogs by blogger controller', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });
  describe('CREATE blog by blogger', () => {
    let token;
    it('should create user with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_1)
        .expect(201);
    });
    it('should login user and return access token', async () => {
      token = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_1)
        .expect(200);
    });
    it('shouldn`t create blog with correct data without token: STATUS 401', async () => {
      await request(server)
        .post('/blogger/blogs')
        .send(blogsConstants.valid_blog_1)
        .expect(401);
    });
    it('shouldn`t create blog with incorrect blog name: STATUS 400', async () => {
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(blogsConstants.invalid_blog_name)
        .expect(400);
    });
    it('shouldn`t create blog with incorrect blog description: STATUS 400', async () => {
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(blogsConstants.invalid_blog_description)
        .expect(400);
    });
    it('shouldn`t create blog with incorrect blog websiteUrl: STATUS 400', async () => {
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(blogsConstants.invalid_blog_websiteUrl)
        .expect(400);
    });
    it('should create blog with correct data: STATUS 201', async () => {
      const newBlog = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(blogsConstants.valid_blog_1)
        .expect(201);

      expect(newBlog.body).toEqual({
        id: expect.any(String),
        ...blogsConstants.valid_blog_1,
        createdAt: expect.any(String),
        isMembership: false,
      });
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('UPDATE blog by blogger', () => {
    let token_1;
    let token_2;
    let blog_1;
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_1)
        .expect(201);
    });
    it('should create user_2 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_1)
        .expect(201);
    });
    it('shouldn`t update blog with correct data by blog id without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .send(blogsConstants.valid_blog_2)
        .expect(401);
    });
    it('shouldn`t update blog with incorrect blog name: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.invalid_blog_name)
        .expect(400);
    });
    it('shouldn`t update blog with incorrect blog description: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.invalid_blog_description)
        .expect(400);
    });
    it('shouldn`t update blog with incorrect blog websiteUrl: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.invalid_blog_websiteUrl)
        .expect(400);
    });
    it('shouldn`t update blog by other user_2: STATUS 403', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(blogsConstants.valid_blog_2)
        .expect(403);
    });
    it('should update blog with correct data by blog id: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_2)
        .expect(204);
    });
    //it('should find blog with updating data: STATUS 200', async () => {});
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('DELETE blog by blog id', () => {
    let token_1;
    let token_2;
    let blog_1;
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_1)
        .expect(201);
    });
    it('should create user_2 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_1)
        .expect(201);
    });
    it('shouldn`t delete blog without authorization: STATUS 401', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}`)
        .expect(401);
    });
    it('shouldn`t delete blog by other user_2: STATUS 403', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(403);
    });
    it('should delete blog by id: STATUS 204', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(204);
    });
    it('shouldn`t delete blog by id which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(404);
    });
    //it('shouldn`t find blog by id: STATUS 404', async () => {});
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });
  describe('GET all blogs of blogger with pagination', () => {
    let token_1;
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(blogsConstants.blogger_1)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(blogsConstants.login_1)
        .expect(200);
    });
    it('should create 5 blogs with correct data: STATUS 201', async () => {
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_1)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_2)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_3)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_4)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(blogsConstants.valid_blog_5)
        .expect(201);
    });
    //it('should get all blogs with default pagination and sorting', async () => {});
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
