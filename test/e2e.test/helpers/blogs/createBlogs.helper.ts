import { BlogToBloggerViewModel } from '../../../../src/modules/bloggers/blogs/types/blogToBloggerViewModel';
import request from 'supertest';
import { saBlogsConstants } from '../../sa/blogs/sa.blogs.constants';
import { HttpStatus } from '@nestjs/common';

export const createSeveralBlogs = async (count: number, server: any) => {
  const createdBlogs: BlogToBloggerViewModel[] = [];
  for (let i = 0; i < count; i++) {
    const result = await request(server)
      .post('/sa/users')
      .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      .send(saBlogsConstants.blogger)
      .expect(HttpStatus.CREATED);

    createdBlogs.push(result.body);
  }

  return createdBlogs;
};
