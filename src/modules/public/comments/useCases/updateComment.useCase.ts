import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../repositories/comments.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public commentContent: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: UpdateCommentCommand): Promise<void> {
    //check does this comment exist
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!comment)
      throw new NotFoundException('Comment with this id does not exist');

    //check is user owner os this comment
    if (comment.userId !== command.userId)
      throw new ForbiddenException(
        'You try update the comment that is not your own',
      );
    // update comment
    comment.content = command.commentContent;
    await this.commentsRepository.saveComment(comment);
    return;
  }
}
