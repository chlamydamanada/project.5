import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../domain/comment.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
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

  /*getStatusEntity() {
    return new this.statusModel();
  }

  async saveStatus(status: StatusEntity): Promise<void> {
    await status.save();
  }*/

  /*async findStatusOfComment(
    entity: string,
    commentId: string,
    userId: string,
  ): Promise<undefined | StatusEntity> {
    const status = await this.statusModel.findOne({
      entityId: commentId,
      entity: entity,
      userId: userId,
    });
    if (!status) return undefined;
    return status;
  }*/
}
