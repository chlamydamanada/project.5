import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { postsConstants } from './posts.constants';

describe('Testing posts by blogger controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CREATE post by blogger', () => {
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_1)
        .expect(201);
    });
    it('should create user_2 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_blog_1)
        .expect(201);
    });
    it('shouldn`t create post without authorization: STATUS 401', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .send(postsConstants.valid_blog_1)
        .expect(401);
    });
    it('shouldn`t create post with incorrect title: STATUS 400', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_title)
        .expect(400);
    });
    it('shouldn`t create post with incorrect short description: STATUS 400', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_shortDescription)
        .expect(400);
    });
    it('shouldn`t create post with incorrect content: STATUS 400', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_content)
        .expect(400);
    });
    it('shouldn`t create post if specific blog doesn`t exists: STATUS 404', async () => {
      await request(server)
        .post(`/blogger/blogs/${postsConstants.invalid_id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(404);
    });
    it('shouldn`t create post with correct data by other blogger: STATUS 403', async () => {
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(403);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(201);

      expect(post_1.body).toEqual({
        id: expect.any(String),
        ...postsConstants.valid_post_1,
        createdAt: expect.any(String),
        blogId: blog_1.body.id,
        blogName: blog_1.body.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
    it('should get post by id from public api: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .expect(200);

      expect(post.body).toEqual({
        id: expect.any(String),
        ...postsConstants.valid_post_1,
        createdAt: expect.any(String),
        blogId: blog_1.body.id,
        blogName: blog_1.body.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('UPDATE post  by blogger', () => {
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    it('should create user_1 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_1)
        .expect(201);
    });
    it('should create user_2 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(201);
    });
    it('shouldn`t update post without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .send(postsConstants.valid_post_2)
        .expect(401);
    });
    it('shouldn`t update post with incorrect title: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_title)
        .expect(400);
    });
    it('shouldn`t update post with incorrect content: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_content)
        .expect(400);
    });
    it('shouldn`t update post with incorrect short description: STATUS 400', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.invalid_post_shortDescription)
        .expect(400);
    });
    it('shouldn`t update post which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(
          `/blogger/blogs/${blog_1.body.id}/posts/${postsConstants.invalid_id}`,
        )
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_2)
        .expect(404);
    });
    it('shouldn`t update post by other blogger: STATUS 403', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(postsConstants.valid_post_2)
        .expect(403);
    });
    it('should update post with correct data: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_2)
        .expect(204);
    });
    it('should get updating post by public api: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .expect(200);

      expect(post.body).toEqual({
        id: expect.any(String),
        ...postsConstants.valid_post_2,
        createdAt: expect.any(String),
        blogId: blog_1.body.id,
        blogName: blog_1.body.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('DELETE post by blogger', () => {
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    it('should create user_3 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_3)
        .expect(201);
    });
    it('should create user_4 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_4)
        .expect(201);
    });
    it('should login user_3 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_3)
        .expect(200);
    });
    it('should login user_4 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_4)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(201);
    });
    it('shouldn`t delete post by id without authorization: STATUS 401', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .expect(401);
    });
    it('shouldn`t delete post by id by other blogger: STATUS 403', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(403);
    });
    it('should delete post by id : STATUS 204', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(204);
    });
    it('shouldn`t delete post by id which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .delete(`/blogger/blogs/${blog_1.body.id}/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(404);
    });
    it('shouldn`t find post which was deleted in public api: STATUS 404', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .expect(404);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET posts by public api', () => {
    let token_1;
    let blog_1;
    let post_1;
    it('should create user_3 with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(postsConstants.blogger_3)
        .expect(201);
    });
    it('should login user_3 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(postsConstants.login_3)
        .expect(200);
    });
    it('should create blog with correct data by user_3: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_blog_1)
        .expect(201);
    });
    it('should create 6 posts with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_1)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_3)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_4)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_5)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_6)
        .expect(201);
      await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(postsConstants.valid_post_7)
        .expect(201);
    });
    it('GET post by id from public api: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        ...postsConstants.valid_post_1,
        createdAt: expect.any(String),
        blogId: blog_1.body.id,
        blogName: blog_1.body.name,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: [],
        },
      });
    });
    it('GET all posts with default pagination and sorting: STATUS 200', async () => {
      const posts = await request(server).get(`/posts`).expect(200);
      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 6,
        items: expect.any(Array),
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
