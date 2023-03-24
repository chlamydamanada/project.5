import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../domain/blog.entity';
import { Repository } from 'typeorm';
import { BlogBanInfo } from '../domain/blogBanInfo.entity';

@Injectable()
export class BlogsToBloggerRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogBanInfo)
    private readonly blogBanInfoRepository: Repository<BlogBanInfo>,
  ) {}

  async findBlogById(blogId: string): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOneBy({ id: blogId });
    if (!blog) return null;
    return blog;
  }

  async saveBlog(blog: Blog): Promise<string> {
    const newBlog = await this.blogsRepository.save(blog);
    return newBlog.id;
  }

  async saveBlogBanInfo(banInfo: BlogBanInfo): Promise<void> {
    await this.blogBanInfoRepository.save(banInfo);
    return;
  }

  async deleteBlog(blogId: string): Promise<void> {
    // cascading delete blog, blog ban info and all posts of this blog
    await this.blogBanInfoRepository.delete(blogId);
    await this.blogsRepository.delete(blogId);
    return;
  }
}
