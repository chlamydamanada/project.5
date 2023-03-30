import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentsRepository } from '../../comments/repositories/comments.repository';
import { UsersRepository } from '../../auth/repositories/users.repository';
import { CommentLikeStatus } from '../domain/commentLikeStatus.entity';

export class GenerateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public status: string,
  ) {}
}
@CommandHandler(GenerateCommentLikeStatusCommand)
export class GenerateCommentLikeStatusUseCase
  implements ICommandHandler<GenerateCommentLikeStatusCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: GenerateCommentLikeStatusCommand): Promise<void> {
    // find comment by id and check does it exist
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!comment)
      throw new NotFoundException('Comment with this id does not exist');

    // find user by id and check does user exist
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');

    //find status for this comment by commentId, userId
    const statusOfComment = await this.commentsRepository.findStatusOfComment(
      command.commentId,
      command.userId,
    );

    //if status not found, should create it and save
    if (!statusOfComment) {
      const newStatus = new CommentLikeStatus();
      newStatus.status = command.status;
      newStatus.userId = command.userId;
      newStatus.commentId = command.commentId;
      await this.commentsRepository.saveStatus(newStatus);
      return;
    }

    //if status found, should update it and save
    statusOfComment.status = command.status;
    await this.commentsRepository.saveStatus(statusOfComment);
    return;
  }
}
