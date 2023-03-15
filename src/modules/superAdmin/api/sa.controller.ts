import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
//import { BasicAuthGuard } from '../public/auth/guards/auth-guard';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepositoryToSA } from './query.repositories/usersQuery.postgresql.repository';
import { userInputModelPipe } from './pipes/userInputDtoPipe';
import { UserQueryPipe } from './pipes/userQueryPipe';
import { UsersViewType } from '../types/usersViewType';
import { CreateUserCommand } from '../application/users.useCases/createUser.useCase';
//import { BanOrUnbanUserCommand } from '../application/users.useCases/banOrUnbanUser.useCase';
import { DeleteUserCommand } from '../application/users.useCases/deleteUser.useCase';
import { UserViewType } from '../types/userViewType';
import { BanStatusInputModelPipe } from './pipes/banStatusInputModelPipe';
import { userQueryType } from '../types/userQueryType';
import { BanOrUnbanUserCommand } from '../application/users.useCases/banOrUnbanUser.useCase';
import { BasicAuthGuard } from '../../public/auth/guards/auth-guard';

@UseGuards(BasicAuthGuard)
@Controller('sa')
export class SaController {
  constructor(
    //private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepositoryToSA,
    private commandBus: CommandBus,
  ) {}

  /*@Get('blogs')
  async getAllBlogs(@Query() query: BlogQweryPipe): Promise<blogsViewType> {
    const blogs = await this.blogsQueryRepository.getAllBlogsBySA(
      query as blogQueryType,
    );
    if (!blogs) throw new NotFoundException('No blogs found');
    return blogs;
  }*/

  /*@Put('blogs/:id/bind-with-user/:userId')
  @HttpCode(204)
  async blogBindToUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.commandBus.execute(new BlogBindToUserCommand(blogId, userId));
    return;
  }*/

  @Get('users')
  async getAllUsers(
    @Query() query: UserQueryPipe,
  ): Promise<UsersViewType | string> {
    const users = await this.usersQueryRepository.getAllUsers(
      query as userQueryType,
    );
    return users;
  }

  @Post('users')
  async createUser(
    @Body() userInputModel: userInputModelPipe,
  ): Promise<UserViewType> {
    const newUserId = await this.commandBus.execute(
      new CreateUserCommand(
        userInputModel.login,
        userInputModel.email,
        userInputModel.password,
      ),
    );
    const newUser = await this.usersQueryRepository.getUserByUserId(newUserId);
    return newUser!;
  }

  @Delete('users/:id')
  @HttpCode(204)
  async deleteUserByUserId(
    @Param('id') userId: string,
  ): Promise<void | string> {
    await this.commandBus.execute(new DeleteUserCommand(userId));
    return;
  }

  @Put('users/:id/ban')
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') userId: string,
    @Body() banStatusInputModel: BanStatusInputModelPipe,
  ) {
    await this.commandBus.execute(
      new BanOrUnbanUserCommand(
        userId,
        banStatusInputModel.isBanned,
        banStatusInputModel.banReason,
      ),
    );
    return;
  }

  /*@Put('blogs/:id/ban')
  @HttpCode(204)
  async banOrUnbanBlog(
    @Param('id') blogId: string,
    @Body() banStatusInputModel: BanOrUnbanBlogPipe,
  ) {
    await this.commandBus.execute(
      new BanOrUnbanBlogCommand({ blogId, ...banStatusInputModel }),
    );
    return;
  }*/
}
