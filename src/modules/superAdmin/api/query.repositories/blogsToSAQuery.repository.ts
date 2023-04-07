import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from '../../../bloggers/domain/blog.entity';
import { ILike, Repository } from 'typeorm';
import { blogQueryType } from '../../../public/blogs/types/blogsQweryType';
import { BlogsSAModel } from '../../types/blogs/blogsSAModel';
import { User } from '../../domain/users.entities/user.entity';
import { BlogBanInfo } from '../../../bloggers/domain/blogBanInfo.entity';

@Injectable()
export class BlogsToSAQueryRepository {
  constructor(
    @InjectRepository(Blog) private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogBanInfo)
    private readonly blogBanInfoRepository: Repository<BlogBanInfo>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}
  async findAllBlogsToSA(queryDto: blogQueryType): Promise<BlogsSAModel> {
    const filter = this.makeBlogsFilter(queryDto.searchNameTerm);
    const blogs = await this.blogsRepository.find({
      relations: {
        blogger: true,
        blogBanInfo: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        websiteUrl: true,
        createdAt: true,
        isMembership: true,
        blogger: {
          id: true,
          login: true,
        },
        blogBanInfo: {
          banDate: true,
          isBanned: true,
        },
      },
      where: filter,
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });

    const totalCount = await this.blogsRepository.count({
      where: filter,
    });

    const result = blogs.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      websiteUrl: b.websiteUrl,
      createdAt: b.createdAt,
      isMembership: b.isMembership,
      blogOwnerInfo: {
        userId: b.blogger.id,
        userLogin: b.blogger.login,
      },
      banInfo: {
        isBanned: b.blogBanInfo.isBanned,
        banDate: b.blogBanInfo.banDate,
      },
    }));
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  makeBlogsFilter(blogName?: string | null) {
    if (blogName) return { name: ILike(`%${blogName}%`) };
    return {};
  }
}
