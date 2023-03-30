import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { publicStatusOfPostConstants } from './public.statusOfPost.constants';

describe('Testing like status of posts by users public controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('PUT like | dislike | none status of post', () => {
    let token_1;
    let token_2;
    let token_3;
    let token_4;
    let blog_1;
    let post_1;
    let post_2;
    let post_3;
    let user_2;
    it('should create blogger and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfPostConstants.user_1)
        .expect(201);

      token_1 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfPostConstants.login_1)
        .expect(200);
    });
    it('should create user 2 and login him: STATUS 201/200', async () => {
      user_2 = await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfPostConstants.user_2)
        .expect(201);

      token_2 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfPostConstants.login_2)
        .expect(200);
    });
    it('should create user 3 and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfPostConstants.user_3)
        .expect(201);

      token_3 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfPostConstants.login_3)
        .expect(200);
    });
    it('should create user 4 and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfPostConstants.user_4)
        .expect(201);

      token_4 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfPostConstants.login_4)
        .expect(200);
    });
    it('should create blog with correct data by blogger: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.blog_1)
        .expect(201);
    });
    it('should create 3 posts with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.post_1)
        .expect(201);

      post_2 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.post_1)
        .expect(201);

      post_3 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.post_1)
        .expect(201);
    });
    it('shouldn`t create like for post with incorrect data: STATUS 400', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.invalid_status)
        .expect(400);
    });
    it('shouldn`t create like for post without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .send(publicStatusOfPostConstants.like)
        .expect(401);
    });
    it('shouldn`t create like for post which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/posts/${publicStatusOfPostConstants.invalid_id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(404);
    });
    it('should get one post without like status: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        title: post_1.body.title,
        shortDescription: post_1.body.shortDescription,
        content: post_1.body.content,
        blogId: post_1.body.blogId,
        blogName: post_1.body.blogName,
        createdAt: post_1.body.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: expect.any(Array),
        },
      });
      expect(post.body.extendedLikesInfo.newestLikes).toHaveLength(0);
    });
    it('should create like for post by user 2: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);
    });
    it('should get one post with one like status: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        title: post_1.body.title,
        shortDescription: post_1.body.shortDescription,
        content: post_1.body.content,
        blogId: post_1.body.blogId,
        blogName: post_1.body.blogName,
        createdAt: post_1.body.createdAt,
        extendedLikesInfo: {
          likesCount: 1,
          dislikesCount: 0,
          myStatus: 'Like',
          newestLikes: [
            {
              addedAt: expect.any(String),
              userId: user_2.body.id,
              login: user_2.body.login,
            },
          ],
        },
      });
      expect(post.body.extendedLikesInfo.newestLikes).toHaveLength(1);
    });
    it('should create dislike for post by user 2: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);
    });
    it('should get one post with one dislike status: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        title: post_1.body.title,
        shortDescription: post_1.body.shortDescription,
        content: post_1.body.content,
        blogId: post_1.body.blogId,
        blogName: post_1.body.blogName,
        createdAt: post_1.body.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 1,
          myStatus: 'Dislike',
          newestLikes: expect.any(Array),
        },
      });

      expect(post.body.extendedLikesInfo.newestLikes).toHaveLength(0);
    });
    it('should create none for post by user 2: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.none)
        .expect(204);
    });
    it('should get one post with none status: STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        title: post_1.body.title,
        shortDescription: post_1.body.shortDescription,
        content: post_1.body.content,
        blogId: post_1.body.blogId,
        blogName: post_1.body.blogName,
        createdAt: post_1.body.createdAt,
        extendedLikesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
          newestLikes: expect.any(Array),
        },
      });

      expect(post.body.extendedLikesInfo.newestLikes).toHaveLength(0);
    });
    it('should create 3 likes and 1 dislike for post_1 by users: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);

      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);

      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);

      await request(server)
        .put(`/posts/${post_1.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_4.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);
    });
    it('should get one post with 3 likes and 1 dislike status by user 2 (likes): STATUS 200', async () => {
      const post = await request(server)
        .get(`/posts/${post_1.body.id}`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .expect(200);

      expect(post.body).toEqual({
        id: post_1.body.id,
        title: post_1.body.title,
        shortDescription: post_1.body.shortDescription,
        content: post_1.body.content,
        blogId: post_1.body.blogId,
        blogName: post_1.body.blogName,
        createdAt: post_1.body.createdAt,
        extendedLikesInfo: {
          likesCount: 3,
          dislikesCount: 1,
          myStatus: 'Like',
          newestLikes: expect.any(Array),
        },
      });
      expect(post.body.extendedLikesInfo.newestLikes).toHaveLength(3);
    });
    it('should create 2 likes and 2 dislikes for post_2 by users: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_2.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);

      await request(server)
        .put(`/posts/${post_2.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);

      await request(server)
        .put(`/posts/${post_2.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(publicStatusOfPostConstants.like)
        .expect(204);

      await request(server)
        .put(`/posts/${post_2.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_4.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);
    });
    it('should create 3 dislikes for post_3 by users: STATUS 204', async () => {
      await request(server)
        .put(`/posts/${post_3.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);

      await request(server)
        .put(`/posts/${post_3.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);

      await request(server)
        .put(`/posts/${post_3.body.id}/like-status`)
        .set('Authorization', `Bearer ${token_4.body.accessToken}`)
        .send(publicStatusOfPostConstants.dislike)
        .expect(204);
    });
    it('should get array of all posts with like status: STATUS 200', async () => {
      const posts = await request(server)
        .get(`/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(200);
      expect(posts.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: [
          {
            id: post_3.body.id,
            title: post_3.body.title,
            shortDescription: post_3.body.shortDescription,
            content: post_3.body.content,
            blogId: post_3.body.blogId,
            blogName: post_3.body.blogName,
            createdAt: post_3.body.createdAt,
            extendedLikesInfo: {
              likesCount: 0,
              dislikesCount: 3,
              myStatus: 'None',
              newestLikes: expect.any(Array),
            },
          },
          {
            id: post_2.body.id,
            title: post_2.body.title,
            shortDescription: post_2.body.shortDescription,
            content: post_2.body.content,
            blogId: post_2.body.blogId,
            blogName: post_2.body.blogName,
            createdAt: post_2.body.createdAt,
            extendedLikesInfo: {
              likesCount: 2,
              dislikesCount: 2,
              myStatus: 'Dislike',
              newestLikes: expect.any(Array),
            },
          },
          {
            id: post_1.body.id,
            title: post_1.body.title,
            shortDescription: post_1.body.shortDescription,
            content: post_1.body.content,
            blogId: post_1.body.blogId,
            blogName: post_1.body.blogName,
            createdAt: post_1.body.createdAt,
            extendedLikesInfo: {
              likesCount: 3,
              dislikesCount: 1,
              myStatus: 'Like',
              newestLikes: expect.any(Array),
            },
          },
        ],
      });
      expect(posts.body.items).toHaveLength(3);
      expect(posts.body.items[0].extendedLikesInfo.newestLikes).toHaveLength(0);
      expect(posts.body.items[1].extendedLikesInfo.newestLikes).toHaveLength(2);
      expect(posts.body.items[2].extendedLikesInfo.newestLikes).toHaveLength(3);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
