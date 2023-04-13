import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogsToBloggerRepository } from '../../blogs/repositories/blogsToBlogger.repository';
import { UsersToBloggerRepository } from '../repositories/usersToBlogger.repository';
import { BanList } from '../domain/banList.entity';

export class BanOrUnbanUserByBloggerCommand {
  constructor(
    public userId: string,
    public bloggerId: string,
    public isBanned: boolean,
    public banReason: string,
    public blogId: string,
  ) {}
}

@CommandHandler(BanOrUnbanUserByBloggerCommand)
export class BanOrUnbanUserByBloggerUseCase
  implements ICommandHandler<BanOrUnbanUserByBloggerCommand>
{
  constructor(
    private readonly usersRepository: UsersToBloggerRepository,
    private readonly blogsRepository: BlogsToBloggerRepository,
  ) {}
  async execute(command: BanOrUnbanUserByBloggerCommand): Promise<void> {
    // check does the user exist
    if (command.userId === command.bloggerId)
      throw new ForbiddenException('You try to ban yourself');
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');
    // check does the blog exist
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');
    //check is blogger owner of this blog
    if (blog.bloggerId !== command.bloggerId)
      throw new ForbiddenException('You can`t ban user for this blog');
    // check user should be banned or unbanned
    if (command.isBanned) {
      // check is user already banned
      const isBanned = await this.usersRepository.findBanListOfBlog(
        command.blogId,
        command.userId,
      );
      if (isBanned) return;
      // ban user for specific blog
      const ban = new BanList();
      ban.blogId = command.blogId;
      ban.bloggerId = command.bloggerId;
      ban.userId = command.userId;
      ban.userLogin = user.login;
      ban.banReason = command.banReason;
      await this.usersRepository.banUserForBlog(ban);
      return;
    }
    //unban user for specific blog
    await this.usersRepository.unbanUserForBlog(command.blogId, command.userId);
    return;
  }
}
