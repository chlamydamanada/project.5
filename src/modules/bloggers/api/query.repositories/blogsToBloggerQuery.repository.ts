import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../domain/blog.entity';
import { ILike, Repository } from 'typeorm';
import { BlogQueryToBloggerType } from '../../types/blogs/blogQueryToBloggerType';
import { BlogsToBloggerViewType } from '../../types/blogs/blogsToBloggerViewType';
import { BlogToBloggerViewType } from '../../types/blogs/blogToBloggerViewType';

@Injectable()
export class BlogsToBloggerQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}

  async getBlogByBlogId(blogId: string): Promise<BlogToBloggerViewType | null> {
    const blog = await this.blogsRepository.findOne({
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
      where: {
        id: blogId,
      },
    });
    if (!blog) return null;
    return blog;
  }

  async getOwnerIdOfBlog(
    blogId: string,
  ): Promise<{ id: string; bloggerId: string } | null> {
    const blog = await this.blogsRepository.findOne({
      select: {
        id: true,
        bloggerId: true,
      },
      where: {
        id: blogId,
      },
    });
    if (!blog) return null;
    return blog;
  }

  async getAllBlogs(
    bloggerId: string,
    queryDto: BlogQueryToBloggerType,
  ): Promise<BlogsToBloggerViewType> {
    const filter = this.makeBlogsFilter(bloggerId, queryDto.searchNameTerm);
    const blogs = await this.blogsRepository.find({
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
      },
      where: filter,
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    const totalCount = await this.blogsRepository.count({
      where: filter,
    });

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: blogs,
    };
  }
  makeBlogsFilter(bloggerId: string, blogName?: string | null) {
    if (blogName) return { bloggerId: bloggerId, name: ILike(`%${blogName}%`) };
    return { bloggerId: bloggerId };
  }
}
