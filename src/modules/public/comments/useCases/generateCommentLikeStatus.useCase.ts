/*import { UserInfoType } from '../../auth/types/userInfoType';
import { StatusPipe } from '../../status/api/pipes/statusPipe';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../repositories/comments.repository';
import { NotFoundException } from '@nestjs/common';

export class GenerateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userInfo: UserInfoType,
    public statusDto: StatusPipe,
  ) {}
}
@CommandHandler(GenerateCommentLikeStatusCommand)
export class GenerateCommentLikeStatusUseCase
  implements ICommandHandler<GenerateCommentLikeStatusCommand>
{
  constructor(private readonly commentsRepository: CommentsRepository) {}
  async execute(command: GenerateCommentLikeStatusCommand): Promise<void> {
    //first step: find comment by id and check does it exist
    const comment = await this.commentsRepository.findCommentById(
      command.commentId,
    );
    if (!comment)
      throw new NotFoundException('Comment with this id does not exist');

    //third step: find status for this comment by commentId, userId and name of entity
    const statusOfComment = await this.commentsRepository.findStatusOfComment(
      'comment',
      command.commentId,
      command.userInfo.id,
    );

    //if status not found, should create it
    if (!statusOfComment) {
      const newStatus = this.commentsRepository.getStatusEntity();
      newStatus.createStatus({
        entity: 'comment',
        entityId: command.commentId,
        userId: command.userInfo.id,
        userLogin: command.userInfo.login,
        status: command.statusDto.likeStatus,
      });
      await this.commentsRepository.saveStatus(newStatus);
      return;
    }

    //if status found, should update it
    statusOfComment.updateStatus(command.statusDto.likeStatus);
    await this.commentsRepository.saveStatus(statusOfComment);
    return;
  }
}
*/
