import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsToBloggerRepository } from '../../repositories/blogsToBlogger.repository';

export class UpdateBlogCommand {
  constructor(
    public blogId: string,
    public bloggerId: string,
    public blogName: string,
    public blogDescription: string,
    public blogWebsite: string,
  ) {}
}
@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsToBloggerRepository) {}
  async execute(command: UpdateBlogCommand): Promise<void> {
    // find blog by id
    const blog = await this.blogsRepository.findBlogById(command.blogId);

    //if blog does not exist
    if (!blog) throw new NotFoundException('Blog with this id does not exist');

    //check is blogger owner of this blog
    if (blog.bloggerId !== command.bloggerId)
      throw new ForbiddenException('Only owner of this blog can update it');

    // update blog
    blog.name = command.blogName;
    blog.description = command.blogDescription;
    blog.websiteUrl = command.blogWebsite;

    // save new blog
    await this.blogsRepository.saveBlog(blog);
    return;
  }
}
