import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BlogBanInfo } from '../../../bloggers/blogs/domain/blogBanInfo.entity';
import { BlogsToSaRepository } from '../repositories/blogsToSa.repository';

export class BanOrUnbanBlogCommand {
  constructor(public blogId: string, public banStatus: boolean) {}
}
@CommandHandler(BanOrUnbanBlogCommand)
export class BanOrUnbanBlogUseCase
  implements ICommandHandler<BanOrUnbanBlogCommand>
{
  constructor(private readonly blogsRepository: BlogsToSaRepository) {}
  async execute(command: BanOrUnbanBlogCommand) {
    //check does blog exist
    const blog = await this.blogsRepository.checkBlog(command.blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');
    //ban blog
    if (command.banStatus) {
      const ban = new BlogBanInfo();
      ban.blogId = command.blogId;
      ban.isBanned = command.banStatus;
      ban.banDate = new Date().toISOString();
      await this.blogsRepository.banOrUnbanBlogBySA(ban);
      return;
    }
    // unban blog
    const unban = new BlogBanInfo();
    unban.blogId = command.blogId;
    unban.isBanned = command.banStatus;
    unban.banDate = null;
    await this.blogsRepository.banOrUnbanBlogBySA(unban);
    return;
  }
}
