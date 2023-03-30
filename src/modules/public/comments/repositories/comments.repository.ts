import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';
import { CommentLikeStatus } from '../../likeStatus/domain/commentLikeStatus.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(CommentLikeStatus)
    private readonly commentLikeStatusRepository: Repository<CommentLikeStatus>,
  ) {}

  async saveComment(comment: Comment): Promise<string> {
    const newComment = await this.commentsRepository.save(comment);
    return newComment.id;
  }

  async findCommentById(commentId: string): Promise<Comment | null> {
    const comment = await this.commentsRepository.findOneBy({ id: commentId });
    return comment;
  }

  async deleteCommentById(commentId: string): Promise<void> {
    await this.commentsRepository.delete({ id: commentId });
    return;
  }

  async saveStatus(status: CommentLikeStatus): Promise<void> {
    await this.commentLikeStatusRepository.save(status);
  }

  async findStatusOfComment(
    commentId: string,
    userId: string,
  ): Promise<null | CommentLikeStatus> {
    const status = await this.commentLikeStatusRepository.findOne({
      where: {
        commentId: commentId,
        userId: userId,
      },
    });
    return status;
  }
}
