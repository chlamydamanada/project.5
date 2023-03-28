import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../../public/comments/domain/comment.entity';
import { commentQueryType } from '../../../public/comments/types/commentQueryType';
import { CommentsViewForBloggerType } from '../../types/comments/commentsViewForBloggerType';

@Injectable()
export class CommentsToBloggerQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}
  async findAllCommentsForAllPosts(
    bloggerId: string,
    queryDto: commentQueryType,
  ): Promise<CommentsViewForBloggerType | null> {
    //get array of all comments of all posts for blogger
    const comments = await this.commentsRepository.find({
      relations: {
        post: true,
      },
      select: {
        id: true,
        content: true,
        userId: true,
        userLogin: true,
        createdAt: true,
        post: {
          id: true,
          title: true,
          blogId: true,
          blogName: true,
        },
      },
      where: {
        post: {
          blog: {
            bloggerId: bloggerId,
          },
        },
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    // get number of all comments by filter
    const totalCount = await this.commentsRepository.count({
      where: {
        post: {
          blog: {
            bloggerId: bloggerId,
          },
        },
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    });
    //make view form of comments
    const result = comments.map((c) => ({
      id: c.id,
      content: c.content,
      commentatorInfo: {
        userId: c.userId,
        userLogin: c.userLogin,
      },
      createdAt: c.createdAt,
      postInfo: {
        id: c.post.id,
        title: c.post.title,
        blogId: c.post.blogId,
        blogName: c.post.blogName,
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
}
