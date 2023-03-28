import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../domain/comment.entity';
import { commentQueryType } from '../../types/commentQueryType';
import { CommentsViewType } from '../../types/commentsViewType';
import { CommentViewType } from '../../types/commentViewType';

@Injectable()
export class CommentsPublicQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}
  async getAllCommentsByPostId(
    postId: string,
    queryDto: commentQueryType,
    userId?: string | undefined | null,
  ): Promise<CommentsViewType> {
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
      comments.map(async (c) => await this.makeViewComment(c, userId)),
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
  ): Promise<CommentViewType | null> {
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
    const result = await this.makeViewComment(comment, userId);
    return result;
  }

  async makeViewComment(
    comment: Comment,
    userId?: string | undefined | null,
  ): Promise<CommentViewType> {
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
        likesCount: 0,
        /*await this.statusModel.count({
          entityId: comment._id,
          entity: 'comment',
          status: 'Like',
          isOwnerBanned: false,
        }),*/
        dislikesCount: 0,
        /*await this.statusModel.count({
          entityId: comment._id,
          entity: 'comment',
          status: 'Dislike',
          isOwnerBanned: false,
        }),*/
        myStatus: 'None',
      },
    };
    /*if (!userId)*/ return newComment;

    // if there userId is, find this user's status
    //const userReaction = await this.statusModel.findOne({
    // entityId: comment._id,
    // entity: 'comment',
    // userId: userId,
    //});
    // and put this status to view model of comment
    // if (userReaction) {
    //  newComment.likesInfo.myStatus = userReaction.status;
    //}
    //return newComment;
  }
}
