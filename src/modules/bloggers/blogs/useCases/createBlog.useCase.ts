import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsToBloggerRepository } from '../repositories/blogsToBlogger.repository';
import { Blog } from '../domain/blog.entity';
import { BlogBanInfo } from '../domain/blogBanInfo.entity';

export class CreateBlogCommand {
  constructor(
    public bloggerId: string,
    public blogName: string,
    public blogDescription: string,
    public blogWebsite: string,
  ) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogUseCase implements ICommandHandler<CreateBlogCommand> {
  constructor(private readonly blogsRepository: BlogsToBloggerRepository) {}
  async execute(command: CreateBlogCommand): Promise<string> {
    // create new blog
    const newBlog = new Blog();
    newBlog.name = command.blogName;
    newBlog.description = command.blogDescription;
    newBlog.websiteUrl = command.blogWebsite;
    newBlog.bloggerId = command.bloggerId;
    // get blog id
    const blogId = await this.blogsRepository.saveBlog(newBlog);
    //create blog ban info
    const blogBanInfo = new BlogBanInfo();
    blogBanInfo.blogId = blogId;
    //save blog ban info
    await this.blogsRepository.saveBlogBanInfo(blogBanInfo);
    return blogId;
  }
}
