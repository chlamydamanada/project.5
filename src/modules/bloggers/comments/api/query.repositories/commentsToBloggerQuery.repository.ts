import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Comment } from '../../../../public/comments/domain/comment.entity';
import { commentQueryType } from '../../../../public/comments/types/commentQueryType';
import { CommentsViewForBloggerModel } from '../../types/commentsViewForBloggerModel';
import { CommentLikeStatus } from '../../../../public/likeStatus/domain/commentLikeStatus.entity';
import { CommentViewForBloggerModel } from '../../types/commentViewForBloggerModel';

@Injectable()
export class CommentsToBloggerQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeStatus)
    private readonly commentLikeStatusRepository: Repository<CommentLikeStatus>,
  ) {}
  async findAllCommentsForAllPosts(
    bloggerId: string,
    queryDto: commentQueryType,
  ): Promise<CommentsViewForBloggerModel> {
    //get array of all comments of all posts for blogger
    const comments = await this.commentsRepository.find({
      relations: {
        post: true,
        status: true,
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
          // banList: {
          //   bloggerId: Not(bloggerId),
          // },
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
    const result = await Promise.all(
      comments.map(
        async (c) => await this.convertToBloggerComment(c, bloggerId),
      ),
    );

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }
  async convertToBloggerComment(
    comment: Comment,
    userId: string,
  ): Promise<CommentViewForBloggerModel> {
    const newComment = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      likesInfo: {
        likesCount: await this.commentLikeStatusRepository.count({
          where: {
            commentId: comment.id,
            status: 'Like',
            user: {
              banInfo: {
                isBanned: false,
              },
            },
          },
        }),
        dislikesCount: await this.commentLikeStatusRepository.count({
          where: {
            commentId: comment.id,
            status: 'Dislike',
            user: {
              banInfo: {
                isBanned: false,
              },
            },
          },
        }),
        myStatus: 'None',
      },
      createdAt: comment.createdAt,
      postInfo: {
        id: comment.post.id,
        title: comment.post.title,
        blogId: comment.post.blogId,
        blogName: comment.post.blogName,
      },
    };
    // find blogger status of comment
    const userReaction = await this.commentLikeStatusRepository.findOne({
      select: {
        id: true,
        status: true,
      },
      where: {
        commentId: comment.id,
        userId: userId,
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    });

    // and put this status to view model of comment
    if (userReaction) {
      newComment.likesInfo.myStatus = userReaction.status;
    }
    return newComment;
  }
}
