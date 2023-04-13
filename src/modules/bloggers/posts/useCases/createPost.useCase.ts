import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsToBloggerRepository } from '../../blogs/repositories/blogsToBlogger.repository';
import { PostsToBloggerRepository } from '../repositories/postsToBlogger.repository';
import { Post } from '../domain/post.entity';

export class CreatePostCommand {
  constructor(
    public blogId: string,
    public bloggerId: string,
    public postTitle: string,
    public postContent: string,
    public postDescription: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly blogsRepository: BlogsToBloggerRepository,
    private readonly postsRepository: PostsToBloggerRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<string> {
    // check does exist blog by id
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');

    // check is blogger owner of this blog
    if (blog.bloggerId !== command.bloggerId)
      throw new ForbiddenException('Only owner of this blog can create post');

    //create new post
    const newPost = new Post();
    newPost.title = command.postTitle;
    newPost.content = command.postContent;
    newPost.shortDescription = command.postDescription;
    newPost.blogId = command.blogId;
    newPost.blogName = blog.name;

    // save post
    const newPostId = await this.postsRepository.savePost(newPost);
    return newPostId;
  }
}
