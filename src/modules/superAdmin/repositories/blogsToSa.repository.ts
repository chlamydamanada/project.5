import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../bloggers/domain/blog.entity';
import { Repository } from 'typeorm';
import { BlogBanInfo } from '../../bloggers/domain/blogBanInfo.entity';

@Injectable()
export class BlogsToSaRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogBanInfo)
    private readonly blogsBanInfoRepository: Repository<BlogBanInfo>,
  ) {}
  async checkBlog(blogId: string): Promise<boolean> {
    const blog = await this.blogsRepository.findOneBy({ id: blogId });
    if (!blog) return false;
    return true;
  }
  async banOrUnbanBlogBySA(status: BlogBanInfo): Promise<void> {
    await this.blogsBanInfoRepository.save(status);
    return;
  }

  async findBlogById(blogId: string): Promise<Blog | null> {
    return this.blogsRepository.findOneBy({ id: blogId });
  }

  async saveBlog(blog: Blog): Promise<void> {
    await this.blogsRepository.save(blog);
  }
}
