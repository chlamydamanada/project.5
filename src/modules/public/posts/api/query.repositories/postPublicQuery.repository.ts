import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../../bloggers/domain/post.entity';
import { postsViewModel } from '../../types/postsViewModel';
import { postQueryType } from '../../types/postsQueryType';
import { postViewModel } from '../../types/postViewModel';
import { PostLikeStatus } from '../../../likeStatus/domain/postLikeStatus.entity';

@Injectable()
export class PostPublicQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLikeStatus)
    private readonly postLikeStatusRepository: Repository<PostLikeStatus>,
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
    const result = await Promise.all(
      posts.map(async (p) => await this.convertToViewPost(p, userId)),
    );
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
  ): Promise<postsViewModel> {
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
    const result = await Promise.all(
      posts.map(async (p) => await this.convertToViewPost(p, userId)),
    );
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
  ): Promise<postViewModel | null> {
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
    return await this.convertToViewPost(post, userId);
  }

  async convertToViewPost(
    post: Post,
    userId: string | null | undefined,
  ): Promise<postViewModel> {
    //make view post and find like count and dislike count
    const newPost: postViewModel = {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: await this.postLikeStatusRepository.count({
          where: {
            postId: post.id,
            status: 'Like',
            user: {
              banInfo: {
                isBanned: false,
              },
            },
          },
        }),
        dislikesCount: await this.postLikeStatusRepository.count({
          where: {
            postId: post.id,
            status: 'Dislike',
            user: {
              banInfo: {
                isBanned: false,
              },
            },
          },
        }),
        myStatus: 'None',
        newestLikes: [],
      },
    };
    // find the  newest likes and make view form
    const newLikes = await this.postLikeStatusRepository.find({
      relations: {
        user: true,
      },
      select: {
        id: true,
        addedAt: true,
        user: {
          id: true,
          login: true,
        },
      },
      where: {
        postId: post.id,
        status: 'Like',
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
      order: { addedAt: 'desc' },
      take: 3,
    });
    newPost.extendedLikesInfo.newestLikes = newLikes.map((s) => ({
      addedAt: s.addedAt,
      userId: s.user.id,
      login: s.user.login,
    }));

    // find user reaction if user id isn`t null
    if (!userId) return newPost;

    const userReaction = await this.postLikeStatusRepository.findOne({
      select: {
        id: true,
        status: true,
      },
      where: {
        postId: post.id,
        userId: userId,
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    });

    userReaction
      ? (newPost.extendedLikesInfo.myStatus = userReaction.status)
      : 'None';

    return newPost;
  }
}
