import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { commentsConstants } from '../../public/comments/public.comments.constants';
import { commentsToBloggerConstants } from './comments.constants';

describe('Testing comments for blogger controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('GET all comments for all posts of blogger', () => {
    let token_1;
    let token_2;
    let token_3;
    let blog_1;
    let blog_2;
    let post_1;
    let post_2;
    let post_3;
    let user_3;
    it('should create blogger and 2 users with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsToBloggerConstants.user_1)
        .expect(201);

      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsToBloggerConstants.user_2)
        .expect(201);

      user_3 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsToBloggerConstants.user_3)
        .expect(201);
    });
    it('should login users and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .send(commentsToBloggerConstants.login_1)
        .expect(200);

      token_2 = await request(server)
        .post('/auth/login')
        .send(commentsToBloggerConstants.login_2)
        .expect(200);

      token_3 = await request(server)
        .post('/auth/login')
        .send(commentsToBloggerConstants.login_3)
        .expect(200);
    });
    it('should create 2 blogs by blogger: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsToBloggerConstants.blog_1)
        .expect(201);

      blog_2 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsToBloggerConstants.blog_2)
        .expect(201);
    });
    it('should create 3 posts to 2 blogs  by blogger: STATUS 201', async () => {
      //one post for first blog
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsToBloggerConstants.post_1)
        .expect(201);

      // two posts for second blog
      post_2 = await request(server)
        .post(`/blogger/blogs/${blog_2.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsToBloggerConstants.post_2)
        .expect(201);

      post_3 = await request(server)
        .post(`/blogger/blogs/${blog_2.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsToBloggerConstants.post_3)
        .expect(201);
    });
    it('should create new comments to 3 posts by users: STATUS 201', async () => {
      //for first post 2 comments
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(201);

      //for second post three comments
      await request(server)
        .post(`/posts/${post_2.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_3)
        .expect(201);
      await request(server)
        .post(`/posts/${post_2.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_4)
        .expect(201);
      await request(server)
        .post(`/posts/${post_2.body.id}/comments`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(commentsConstants.comment_5)
        .expect(201);

      //for third post one comment
      await request(server)
        .post(`/posts/${post_3.body.id}/comments`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(commentsConstants.comment_6)
        .expect(201);
    });
    it('should get array of all comments of all posts by blogger: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/blogger/blogs/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 6,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(6);
    });

    it('create blog, post and comment by another user: STATUS 201', async () => {
      //create blog by user 2
      const blog = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsToBloggerConstants.blog_1)
        .expect(201);

      //create post by user 2
      const post = await request(server)
        .post(`/blogger/blogs/${blog.body.id}/posts`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsToBloggerConstants.post_1)
        .expect(201);

      //create comment by user 1
      await request(server)
        .post(`/posts/${post.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);
    });

    it('should get array of 6 comments of all posts for blogger: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/blogger/blogs/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 6,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(6);
    });

    it('should ban user 3 by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/users/${user_3.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send({
          isBanned: true,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });

    it('should get array of 3 comments of all posts for blogger: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/blogger/blogs/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(3);
    });

    it('should unban user 3 by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/users/${user_3.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send({
          isBanned: false,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });

    it('should get array of comments of all posts with page size 3 page number 2: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/blogger/blogs/comments?pageSize=3&pageNumber=2`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 3,
        totalCount: 6,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(3);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
