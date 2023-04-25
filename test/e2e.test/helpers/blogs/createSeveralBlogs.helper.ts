import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { BlogsConstants } from '../../testsConstants/blogsConstants';

type BlogType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export const createSeveralBlogs = async (
  count: number,
  server: any,
  token: string,
): Promise<BlogType[]> => {
  // max count of blogs = 10
  const createdBlogs: BlogType[] = [];

  for (let i = 1; i <= count; i++) {
    //create blog
    const res = await request(server)
      .post('/blogger/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(BlogsConstants[`valid_blog_` + i])
      .expect(HttpStatus.CREATED);

    //add to array of blogs
    createdBlogs.push(res.body);
  }
  return createdBlogs;
};
