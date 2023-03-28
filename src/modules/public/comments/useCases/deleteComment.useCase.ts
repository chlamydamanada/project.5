import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../repositories/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}
@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!comment)
      throw new NotFoundException('Comment with this id does not exist');
    if (comment.userId !== command.userId)
      throw new ForbiddenException(
        'You try delete the comment that is not your own',
      );
    await this.commentsRepository.deleteCommentById(command.commentId);
    return;
  }
}
