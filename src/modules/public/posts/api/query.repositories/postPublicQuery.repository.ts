import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../../bloggers/domain/post.entity';
import { postsViewType } from '../../types/postsViewType';
import { postQueryType } from '../../types/postsQueryType';
import { Blog } from '../../../../bloggers/domain/blog.entity';
import { BlogBanInfo } from '../../../../bloggers/domain/blogBanInfo.entity';
import { postViewType } from '../../types/postViewType';

@Injectable()
export class PostPublicQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Blog)
    private readonly blogsRepository: Repository<Blog>,
    @InjectRepository(BlogBanInfo)
    private readonly blogsBanInfoRepository: Repository<BlogBanInfo>,
  ) {}

  async findAllPosts(queryDto: postQueryType, userId?: string | null) {
    //get array of all posts
    const posts = await this.postsRepository.find({
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
      },
      where: {
        blog: {
          blogBanInfo: {
            isBanned: false,
          },
          blogger: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      },
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    //count number of posts by filter
    const totalCount = await this.postsRepository.count({
      where: {
        blog: {
          blogBanInfo: {
            isBanned: false,
          },
          blogger: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      },
    });
    //make view form of posts
    const result = posts.map((p) => this.convertToViewPost(p));
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  async findAllPostsByBlogId(
    blogId: string,
    queryDto: postQueryType,
    userId?: string | null,
  ): Promise<postsViewType> {
    const posts = await this.postsRepository.find({
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
      },
      where: {
        blogId: blogId,
        blog: {
          blogBanInfo: {
            isBanned: false,
          },
          blogger: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      },
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    //count number of posts by filter
    const totalCount = await this.postsRepository.count({
      where: {
        blogId: blogId,
        blog: {
          blogBanInfo: {
            isBanned: false,
          },
          blogger: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      },
    });
    //make view form of posts
    const result = posts.map((p) => this.convertToViewPost(p));
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  async findPostByPostId(
    postId: string,
    userId?: string | null,
  ): Promise<postViewType | null> {
    const post = await this.postsRepository.findOne({
      select: {
        id: true,
        title: true,
        shortDescription: true,
        content: true,
        blogId: true,
        blogName: true,
        createdAt: true,
      },
      where: {
        id: postId,
        blog: {
          blogBanInfo: {
            isBanned: false,
          },
          blogger: {
            banInfo: {
              isBanned: false,
            },
          },
        },
      },
    });
    if (!post) return null;
    const result = this.convertToViewPost(post);
    return result;
  }

  convertToViewPost(post: Post): postViewType {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
