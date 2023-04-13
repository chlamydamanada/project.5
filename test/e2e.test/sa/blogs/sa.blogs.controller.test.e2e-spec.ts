import { HttpStatus, INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { saBlogsConstants } from './sa.blogs.constants';
import { BlogToBloggerViewModel } from '../../../../src/modules/bloggers/blogs/types/blogToBloggerViewModel';
import { createSeveralBlogs } from '../../helpers/blogs/createBlogs.helper';

describe('Testing sa blogs controller', () => {
  let app: INestApplication;
  let server: any;
  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  const blog = createSeveralBlogs(1, server);

  describe('BAN OR UNBAN BLOG by sa', () => {
    let blogs;
    beforeAll(() => {
      //create 1 user
      //create blogs
    });
    let token;
    let blog_1;
    it('should create blogger with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saBlogsConstants.blogger)
        .expect(201);
    });
    it('should login blogger and return access token', async () => {
      token = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(saBlogsConstants.login)
        .expect(200);
    });
    it('should create 5 blogs with correct data by blogger: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.blog_1)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.blog_2)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.blog_3)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.blog_4)
        .expect(201);
      await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.blog_5)
        .expect(201);
    });
    it('should create 2 posts to blog_1 by blogger: STATUS 201', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.post_1)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token.body.accessToken}`)
        .send(saBlogsConstants.post_2)
        .expect(201);
    });
    it('shouldn`t ban blog without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/sa/blogs/${blog_1.body.id}/ban`)
        .send(saBlogsConstants.banBlog)
        .expect(401);
    });
    it('shouldn`t ban blog with incorrect input value: STATUS 400', async () => {
      await request(server)
        .put(`/sa/blogs/${blog_1.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send({ isBanned: 'string' })
        .expect(400);
    });
    it('shouldn`t ban blog which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/sa/blogs/${saBlogsConstants.invalid_id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saBlogsConstants.banBlog)
        .expect(404);
    });
    it('should ban blog by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/blogs/${blog_1.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saBlogsConstants.banBlog)
        .expect(204);
    });
    it('shouldn`t get blog by id which was banned in public api: STATUS 404', async () => {
      await request(server).get(`/blogs/${blog_1.body.id}`).expect(404);
    });
    it('should get array of blogs without blog which was banned: STATUS 200', async () => {
      const blogs = await request(server).get(`/blogs`).expect(200);

      expect(blogs.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: expect.any(Array),
      });

      expect(blogs.body.items).toHaveLength(4);
    });
    it('shouldn`t get posts of blog which was banned: STATUS 404', async () => {
      await request(server).get(`/blogs/${blog_1.body.id}/posts`).expect(404);
    });
    it('should unban blog by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/blogs/${blog_1.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(saBlogsConstants.unbanBlog)
        .expect(204);
    });
    it('should get blog by id which was unbanned in public api: STATUS 200', async () => {
      const res = await request(server)
        .get(`/blogs/${blog_1.body.id}`)
        .expect(200);

      expect(res.body).toEqual(blog_1.body);
    });
    it('should get posts of blog which was unbanned: STATUS 200', async () => {
      const res = await request(server)
        .get(`/blogs/${blog_1.body.id}/posts`)
        .expect(200);

      expect(res.body.items).toHaveLength(2);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });
  //describe('GET BLOGS BY SA', () => {});

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
