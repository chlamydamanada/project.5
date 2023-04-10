import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { commentsConstants } from './public.comments.constants';

describe('Testing comments by users public controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CREATE comment by user', () => {
    let user_2;
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    let comment_1;
    it('should create blogger with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_1)
        .expect(201);
    });
    it('should create user with correct data by sa: STATUS 201', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.post_1)
        .expect(201);
    });
    it('shouldn`t create comment without authorization: STATUS 401', async () => {
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .send(commentsConstants.comment_1)
        .expect(401);
    });
    it('shouldn`t create comment with incorrect content: STATUS 400', async () => {
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.invalid_comment_content)
        .expect(400);
    });
    it('shouldn`t create comment to post which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .post(`/posts/${commentsConstants.invalid_id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(404);
    });
    it('should create new comment to post by user_2: STATUS 201', async () => {
      comment_1 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);

      expect(comment_1.body).toEqual({
        id: expect.any(String),
        ...commentsConstants.comment_1,
        createdAt: expect.any(String),
        commentatorInfo: {
          userId: user_2.body.id,
          userLogin: user_2.body.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
    it('should return comment by id: STATUS 200', async () => {
      const comment = await request(server)
        .get(`/comments/${comment_1.body.id}`)
        .expect(200);

      expect(comment.body).toEqual({
        id: comment_1.body.id,
        ...commentsConstants.comment_1,
        createdAt: expect.any(String),
        commentatorInfo: {
          userId: user_2.body.id,
          userLogin: user_2.body.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
    it('should ban user by blogger to blog: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/users/${user_2.body.id}/ban`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send({
          isBanned: true,
          banReason: 'some reason for ban user',
          blogId: blog_1.body.id,
        })
        .expect(204);
    });
    it('shouldn`t create comment by user which was banned to blog of this post by blogger: STATUS 403', async () => {
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(403);
    });
    it('should unban user by blogger to blog: STATUS 204', async () => {
      await request(server)
        .put(`/blogger/users/${user_2.body.id}/ban`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send({
          isBanned: false,
          banReason: 'some reason for unban user',
          blogId: blog_1.body.id,
        })
        .expect(204);
    });
    it('should create comment by user which was unbanned to blog of this post by blogger: STATUS 201', async () => {
      const comment = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(201);

      expect(comment.body).toEqual({
        id: expect.any(String),
        ...commentsConstants.comment_2,
        createdAt: expect.any(String),
        commentatorInfo: {
          userId: user_2.body.id,
          userLogin: user_2.body.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('UPDATE comment by owner', () => {
    let user_2;
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    let comment_1;
    it('should create blogger with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_1)
        .expect(201);
    });
    it('should create user with correct data by sa: STATUS 201', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.post_1)
        .expect(201);
    });
    it('should create new comment to post by user: STATUS 201', async () => {
      comment_1 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);
    });
    it('shouldn`t update comment without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/comments/${comment_1.body.id}`)
        .send(commentsConstants.comment_2)
        .expect(401);
    });
    it('shouldn`t update comment another user which isn`t owner os comment: STATUS 403', async () => {
      await request(server)
        .put(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(403);
    });
    it('shouldn`t update comment which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/comments/${commentsConstants.invalid_id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(404);
    });
    it('should update comment by owner: STATUS 204', async () => {
      await request(server)
        .put(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(204);
    });
    it('should return comment by id: STATUS 200', async () => {
      const comment = await request(server)
        .get(`/comments/${comment_1.body.id}`)
        .expect(200);

      expect(comment.body).toEqual({
        id: comment_1.body.id,
        ...commentsConstants.comment_2,
        createdAt: expect.any(String),
        commentatorInfo: {
          userId: user_2.body.id,
          userLogin: user_2.body.login,
        },
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
      });
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('DELETE comment by id', () => {
    let user_2;
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    let comment_1;
    it('should create blogger with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_1)
        .expect(201);
    });
    it('should create user with correct data by sa: STATUS 201', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by user_1: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.post_1)
        .expect(201);
    });
    it('should create new comment to post by user: STATUS 201', async () => {
      comment_1 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);
    });
    it('shouldn`t delete comment without authorization: STATUS 401', async () => {
      await request(server)
        .delete(`/comments/${comment_1.body.id}`)
        .expect(401);
    });
    it('should delete comment to post by other user which isn`t owner of the comment: STATUS 403', async () => {
      await request(server)
        .delete(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(403);
    });
    it('should delete comment to post by user: STATUS 204', async () => {
      await request(server)
        .delete(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(204);
    });
    it('shouldn`t delete comment which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .delete(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(404);
    });
    it('shouldn`t return comment by id which doesn`t exist: STATUS 404', async () => {
      await request(server).get(`/comments/${comment_1.body.id}`).expect(404);
    });
  });

  describe('DELETE ALL DATA', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET comments with sorting and pagination', () => {
    let user_2;
    let token_1;
    let token_2;
    let blog_1;
    let post_1;
    it('should create blogger with correct data by sa: STATUS 201', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_1)
        .expect(201);
    });
    it('should create user with correct data by sa: STATUS 201', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(commentsConstants.user_2)
        .expect(201);
    });
    it('should login user_1 and return access token', async () => {
      token_1 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_1)
        .expect(200);
    });
    it('should login user_2 and return access token', async () => {
      token_2 = await request(server)
        .post('/auth/login')
        .set('User-Agent', 'Chrome')
        .send(commentsConstants.login_2)
        .expect(200);
    });
    it('should create blog with correct data by blogger: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.blog_1)
        .expect(201);
    });
    it('should create post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.post_1)
        .expect(201);
    });
    it('should create new comments to post by user 2: STATUS 201', async () => {
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_1)
        .expect(201);
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(commentsConstants.comment_2)
        .expect(201);
    });
    it('should create new comments to post by blogger: STATUS 201', async () => {
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_3)
        .expect(201);
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_4)
        .expect(201);
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_5)
        .expect(201);
      await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(commentsConstants.comment_6)
        .expect(201);
    });
    it('should return array of all comments for specified post with default sorting and pagination: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/posts/${post_1.body.id}/comments`)
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
    it('should ban user 2 by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/users/${user_2.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send({
          isBanned: true,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });
    it('should return array with 4 comments and without comments of banned user: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/posts/${post_1.body.id}/comments`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(4);
    });
    it('should unban user 2 by sa: STATUS 204', async () => {
      await request(server)
        .put(`/sa/users/${user_2.body.id}/ban`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send({
          isBanned: false,
          banReason: 'stringstringstringst',
        })
        .expect(204);
    });
    it('should return array with 6 comments: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/posts/${post_1.body.id}/comments`)
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
    it('should return array of comments with page size 2 and page number 3: STATUS 200', async () => {
      const comments = await request(server)
        .get(`/posts/${post_1.body.id}/comments?pageSize=2&pageNumber=3`)
        .expect(200);

      expect(comments.body).toEqual({
        pagesCount: 3,
        page: 3,
        pageSize: 2,
        totalCount: 6,
        items: expect.any(Array),
      });
      expect(comments.body.items).toHaveLength(2);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
