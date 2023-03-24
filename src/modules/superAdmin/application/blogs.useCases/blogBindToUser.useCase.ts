import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BlogsToSaRepository } from '../../repositories/blogsToSa.repository';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';

export class BlogBindToUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BlogBindToUserCommand)
export class BlogBindToUserUseCase
  implements ICommandHandler<BlogBindToUserCommand>
{
  constructor(
    private readonly blogsRepository: BlogsToSaRepository,
    private readonly usersRepository: UsersRepositoryToSA,
  ) {}
  async execute(command: BlogBindToUserCommand): Promise<void> {
    //check does blog exist
    const blog = await this.blogsRepository.findBlogById(command.blogId);
    if (!blog)
      throw new BadRequestException([
        { message: 'Blog not found', field: 'blogId' },
      ]);
    //check does blogger exist
    const ownerOfBlog = await this.usersRepository.findUserById(blog.bloggerId);
    if (ownerOfBlog)
      throw new BadRequestException([
        { message: 'Blog already bound to the user', field: 'blogId' },
      ]);
    //check does new blogger exist
    const user = await this.usersRepository.findUserById(command.userId);
    if (!user)
      throw new BadRequestException([
        { message: 'User not found', field: 'userId' },
      ]);
    //change owner of blog
    blog.bloggerId = command.userId;
    await this.blogsRepository.saveBlog(blog);
    return;
  }
}
