import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comment.entity';
import { commentQueryType } from '../../types/commentQueryType';
import { CommentsViewModel } from '../../types/commentsViewModel';
import { CommentViewModel } from '../../types/commentViewModel';
import { CommentLikeStatus } from '../../../likeStatus/domain/commentLikeStatus.entity';

@Injectable()
export class CommentsPublicQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeStatus)
    private readonly commentLikeStatusRepository: Repository<CommentLikeStatus>,
  ) {}
  async getAllCommentsByPostId(
    postId: string,
    queryDto: commentQueryType,
    userId?: string | undefined | null,
  ): Promise<CommentsViewModel> {
    // get array of all comments by filter, get page number by page size
    const comments = await this.commentsRepository.find({
      select: {
        id: true,
        content: true,
        createdAt: true,
        userId: true,
        userLogin: true,
      },
      where: {
        postId: postId,
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
        postId: postId,
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    });
    // make view type and count the number of likes for each comment
    const result = await Promise.all(
      comments.map(async (c) => await this.convertToViewComment(c, userId)),
    );
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }
  async getCommentByCommentId(
    commentId: string,
    userId?: string | undefined | null,
  ): Promise<CommentViewModel | null> {
    //found comment by id
    const comment = await this.commentsRepository.findOne({
      select: {
        id: true,
        content: true,
        userId: true,
        userLogin: true,
        createdAt: true,
      },
      where: {
        id: commentId,
        user: {
          banInfo: {
            isBanned: false,
          },
        },
      },
    });
    if (!comment) return null;
    //make view type and count the number of likes for this comment
    return await this.convertToViewComment(comment, userId);
  }

  async convertToViewComment(
    comment: Comment,
    userId?: string | undefined | null,
  ): Promise<CommentViewModel> {
    // make view type of comment and count the number of likes or dislikes of comment
    const newComment = {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.userId,
        userLogin: comment.userLogin,
      },
      createdAt: comment.createdAt,
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
    };
    if (!userId) return newComment;

    // if there userId is, find this user's status
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
