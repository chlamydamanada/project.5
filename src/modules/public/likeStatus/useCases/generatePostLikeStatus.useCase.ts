import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PostsRepository } from '../../posts/repositories/posts.repository';
import { UsersRepository } from '../../auth/repositories/users.repository';
import { PostLikeStatus } from '../domain/postLikeStatus.entity';
import { reactionStatusType } from '../types/statusType';

export class GeneratePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: reactionStatusType,
  ) {}
}

@CommandHandler(GeneratePostLikeStatusCommand)
export class GeneratePostLikeStatusUseCase
  implements ICommandHandler<GeneratePostLikeStatusCommand>
{
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: GeneratePostLikeStatusCommand): Promise<void> {
    // find post by id and check does it exist
    const post = await this.postsRepository.checkPostExists(command.postId);
    if (!post) throw new NotFoundException('Post with this id does not exist');

    // find user by id and check does user exist
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');

    // find status for this post by postId and userId
    const statusOfPost = await this.postsRepository.findStatusOfPost(
      command.postId,
      command.userId,
    );

    //if status not found, should create it and save
    if (!statusOfPost) {
      const newStatus = new PostLikeStatus();
      newStatus.postId = command.postId;
      newStatus.userId = command.userId;
      newStatus.status = command.likeStatus;

      await this.postsRepository.saveStatus(newStatus);
      return;
    }

    //if status found, should update it
    statusOfPost.status = command.likeStatus;
    await this.postsRepository.saveStatus(statusOfPost);
    return;
  }
}
