import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Blog } from '../../../../bloggers/domain/blog.entity';
import { blogQueryType } from '../../types/blogsQweryType';
import { blogsViewType } from '../../types/blogsViewType';
import { blogViewType } from '../../types/blogViewType';

@Injectable()
export class BlogPublicQueryRepository {
  constructor(
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
  ) {}
  async findAllBlogs(queryDto: blogQueryType): Promise<blogsViewType> {
    const filter = this.makeBlogsFilter(queryDto.searchNameTerm);
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
  makeBlogsFilter(blogName?: string | null) {
    if (blogName) return { name: ILike(`%${blogName}%`) };
    return {};
  }

  async findBlogById(blogId: string): Promise<blogViewType | null> {
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
}