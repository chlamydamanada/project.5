import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsToBloggerRepository } from '../../repositories/blogsToBlogger.repository';
import { PostsToBloggerRepository } from '../../repositories/postsToBlogger.repository';

export class DeletePostCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public bloggerId: string,
  ) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsToBloggerRepository,
    private readonly postsRepository: PostsToBloggerRepository,
  ) {}
  async execute(command: DeletePostCommand): Promise<void> {
    // check does blog exist
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');
    // check is blogger owner of blog
    if (blog.bloggerId !== command.bloggerId)
      throw new ForbiddenException('Only owner of this blog can delete post');
    //check does post exist
    const post = await this.postsRepository.findPostById(command.postId);
    if (!post) throw new NotFoundException('Post with this id does not exist');
    //check does this post belong this blog
    if (post.blogId !== command.blogId)
      throw new ForbiddenException('This post belongs to other blog');
    //delete post
    await this.postsRepository.deletePost(command.postId);
    return;
  }
}
