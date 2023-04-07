import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepositoryToSA } from './query.repositories/usersToSAQuery.repository';
import { UsersViewModel } from '../types/users/usersViewModel';
import { CreateUserCommand } from '../application/users.useCases/createUser.useCase';
import { DeleteUserCommand } from '../application/users.useCases/deleteUser.useCase';
import { UserViewModel } from '../types/users/userViewType';
import { userQueryType } from '../types/users/userQueryType';
import { BanOrUnbanUserCommand } from '../application/users.useCases/banOrUnbanUser.useCase';
import { BasicAuthGuard } from '../../public/auth/guards/auth-guard';
import { UsersToSAQueryDto } from './pipes/users.pipes/usersToSAQuery.dto';
import { userCreateInputDto } from './pipes/users.pipes/userCreateInput.dto';
import { BanOrUnbanUserBySADto } from './pipes/users.pipes/banOrUnbanUserBySA.dto';
import { BanOrUnbanBlogDto } from './pipes/blogs.pipes/banOrUnbanBlog.dto';
import { BanOrUnbanBlogCommand } from '../application/blogs.useCases/banOrUnbanBlog.useCase';
import { BlogBindToUserCommand } from '../application/blogs.useCases/blogBindToUser.useCase';
import { blogQueryType } from '../../public/blogs/types/blogsQweryType';
import { BlogsToSAQueryDto } from './pipes/blogs.pipes/blogsToSAQuery.dto';
import { BlogsToSAQueryRepository } from './query.repositories/blogsToSAQuery.repository';
import { BlogsSAModel } from '../types/blogs/blogsSAModel';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { GetBlogsBySASwaggerDecorator } from '../../../swagger/decorators/sa/blogs/getBlogsBySA.swagger.decorator';
import { BlogBindToUserSwaggerDecorator } from '../../../swagger/decorators/sa/blogs/blogBindToUser.swagger.decorator';
import { BanBlogBySASwaggerDecorator } from '../../../swagger/decorators/sa/blogs/banBlogBySA.swagger.decorator';
import { GetUsersBySASwaggerDecorator } from '../../../swagger/decorators/sa/users/getUsersBySA.swagger.decorator';
import { CreateUserBySASwaggerDecorator } from '../../../swagger/decorators/sa/users/createUserBySASwaggerDecorator';
import { DeleteUserBySASwaggerDecorator } from '../../../swagger/decorators/sa/users/deleteUserBySA.swagger.decorator';
import { BanUserBySASwaggerDecorator } from '../../../swagger/decorators/sa/users/banUserBySA.swagger.decorator';

@ApiTags('SuperAdmin')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa')
export class SaController {
  constructor(
    private readonly blogsQueryRepository: BlogsToSAQueryRepository,
    private readonly usersQueryRepository: UsersQueryRepositoryToSA,
    private commandBus: CommandBus,
  ) {}

  @Get('blogs')
  @GetBlogsBySASwaggerDecorator()
  async getAllBlogs(@Query() query: BlogsToSAQueryDto): Promise<BlogsSAModel> {
    const blogs = await this.blogsQueryRepository.findAllBlogsToSA(
      query as blogQueryType,
    );
    return blogs;
  }

  @Put('blogs/:id/bind-with-user/:userId')
  @BlogBindToUserSwaggerDecorator()
  @HttpCode(204)
  async blogBindToUser(
    @Param('id') blogId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    await this.commandBus.execute<BlogBindToUserCommand>(
      new BlogBindToUserCommand(blogId, userId),
    );
    return;
  }

  @Get('users')
  @GetUsersBySASwaggerDecorator()
  async getAllUsers(
    @Query() query: UsersToSAQueryDto,
  ): Promise<UsersViewModel> {
    const users = await this.usersQueryRepository.getAllUsers(
      query as userQueryType,
    );
    return users;
  }

  @Post('users')
  @CreateUserBySASwaggerDecorator()
  async createUser(
    @Body() userInputModel: userCreateInputDto,
  ): Promise<UserViewModel> {
    const newUserId = await this.commandBus.execute<CreateUserCommand, string>(
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
  @DeleteUserBySASwaggerDecorator()
  @HttpCode(204)
  async deleteUserByUserId(
    @Param('id') userId: string,
  ): Promise<void | string> {
    await this.commandBus.execute<DeleteUserCommand>(
      new DeleteUserCommand(userId),
    );
    return;
  }

  @Put('users/:id/ban')
  @BanUserBySASwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') userId: string,
    @Body() banStatusInputModel: BanOrUnbanUserBySADto,
  ) {
    await this.commandBus.execute<BanOrUnbanUserCommand>(
      new BanOrUnbanUserCommand(
        userId,
        banStatusInputModel.isBanned,
        banStatusInputModel.banReason,
      ),
    );
    return;
  }

  @Put('blogs/:id/ban')
  @BanBlogBySASwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanBlog(
    @Param('id') blogId: string,
    @Body() banStatusInputModel: BanOrUnbanBlogDto,
  ) {
    await this.commandBus.execute<BanOrUnbanBlogCommand>(
      new BanOrUnbanBlogCommand(blogId, banStatusInputModel.isBanned),
    );
    return;
  }
}
