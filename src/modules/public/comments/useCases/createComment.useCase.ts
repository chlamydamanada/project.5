import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../auth/repositories/users.repository';
import { CommentsRepository } from '../repositories/comments.repository';
import { PostsRepository } from '../../posts/repositories/posts.repository';
import { Comment } from '../domain/comment.entity';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public commentContent: string,
    public userId: string,
  ) {}
}
@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase
  implements ICommandHandler<CreateCommentCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly postsRepository: PostsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: CreateCommentCommand): Promise<string> {
    // find post by id and check does it exist
    const post = await this.postsRepository.checkPostExists(command.postId);
    if (!post) throw new NotFoundException('Post with this id does not exist');

    // find user by id and check does user exist
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');

    //check is user banned by blogger
    const isUserBanned = await this.usersRepository.checkUserIsBannedToBlog(
      command.userId,
      post.blogId,
    );
    if (isUserBanned)
      throw new ForbiddenException('You can`t comment this post');

    //create new comment
    const newComment = new Comment();
    newComment.content = command.commentContent;
    newComment.userId = command.userId;
    newComment.userLogin = user.login;
    newComment.postId = command.postId;

    // save this comment and return comment ID
    const commentId = await this.commentsRepository.saveComment(newComment);
    return commentId;
  }
}
