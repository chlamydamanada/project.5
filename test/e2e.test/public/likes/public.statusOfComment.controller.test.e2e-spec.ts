import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { publicStatusOfPostConstants } from './public.statusOfPost.constants';
import { publicStatusOfCommentConstants } from './public.statusOfComment.constants';
import { commentsConstants } from '../comments/public.comments.constants';

describe('Testing like status of comments by users public controller', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('PUT like | dislike| none status to comments by users', () => {
    let token_1;
    let token_2;
    let token_3;
    let token_4;
    let blog_1;
    let post_1;
    let comment_1;
    let comment_2;
    let comment_3;
    it('should create blogger and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfCommentConstants.user_1)
        .expect(201);

      token_1 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfCommentConstants.login_1)
        .expect(200);
    });
    it('should create user 2 and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfCommentConstants.user_2)
        .expect(201);

      token_2 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfCommentConstants.login_2)
        .expect(200);
    });
    it('should create user 3 and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfCommentConstants.user_3)
        .expect(201);

      token_3 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfCommentConstants.login_3)
        .expect(200);
    });
    it('should create user 4 and login him: STATUS 201/200', async () => {
      await request(server)
        .post('/sa/users')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(publicStatusOfCommentConstants.user_4)
        .expect(201);

      token_4 = await request(server)
        .post('/auth/login')
        .send(publicStatusOfCommentConstants.login_4)
        .expect(200);
    });
    it('should create blog with correct data by blogger: STATUS 201', async () => {
      blog_1 = await request(server)
        .post('/blogger/blogs')
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfCommentConstants.blog_1)
        .expect(201);
    });
    it('should create one post with correct data by blogger: STATUS 201', async () => {
      post_1 = await request(server)
        .post(`/blogger/blogs/${blog_1.body.id}/posts`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .send(publicStatusOfCommentConstants.post_1)
        .expect(201);
    });
    it('should create 3 new comments to post by user 2, 3, 4: STATUS 201', async () => {
      comment_1 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_2.body.accessToken}`)
        .send(publicStatusOfCommentConstants.comment_1)
        .expect(201);

      comment_2 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_3.body.accessToken}`)
        .send(publicStatusOfCommentConstants.comment_2)
        .expect(201);

      comment_3 = await request(server)
        .post(`/posts/${post_1.body.id}/comments`)
        .set('Authorization', `Bearer ${token_4.body.accessToken}`)
        .send(publicStatusOfCommentConstants.comment_3)
        .expect(201);
    });
    it('should get comment_1 with status none by blogger: STATUS 200', async () => {
      const comment = await request(server)
        .get(`/comments/${comment_1.body.id}`)
        .set('Authorization', `Bearer ${token_1.body.accessToken}`)
        .expect(201);

      expect(comment.body).toEqual({
        id: comment_1.body.id,
        content: comment_1.body.content,
        commentatorInfo: {
          userId: comment_1.body.commentatorInfo.userId,
          userLogin: comment_1.body.commentatorInfo.userLogin,
        },
        createdAt: comment_1.body.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None',
        },
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
