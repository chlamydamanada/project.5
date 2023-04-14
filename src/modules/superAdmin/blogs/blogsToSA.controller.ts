import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../public/auth/guards/auth-guard';
import { CommandBus } from '@nestjs/cqrs';
import { BanBlogBySASwaggerDecorator } from '../../../swagger/decorators/sa/blogs/banBlogBySA.swagger.decorator';
import { BlogBindToUserCommand } from './useCases/blogBindToUser.useCase';
import { BlogsToSAQueryDto } from './api/pipes/blogsToSAQuery.dto';
import { BlogsToSAQueryRepository } from './api/query.repositories/blogsToSAQuery.repository';
import { BlogBindToUserSwaggerDecorator } from '../../../swagger/decorators/sa/blogs/blogBindToUser.swagger.decorator';
import { BlogsSAModel } from './types/blogsSAModel';
import { BanOrUnbanBlogDto } from './api/pipes/banOrUnbanBlog.dto';
import { BanOrUnbanBlogCommand } from './useCases/banOrUnbanBlog.useCase';
import { GetBlogsBySASwaggerDecorator } from '../../../swagger/decorators/sa/blogs/getBlogsBySA.swagger.decorator';
import { blogQueryType } from '../../public/blogs/types/blogsQueryType';

@ApiTags('Blogs')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class BlogsToSAController {
  constructor(
    private readonly blogsQueryRepository: BlogsToSAQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @GetBlogsBySASwaggerDecorator()
  async getAllBlogs(@Query() query: BlogsToSAQueryDto): Promise<BlogsSAModel> {
    const blogs = await this.blogsQueryRepository.findAllBlogsToSA(
      query as blogQueryType,
    );
    return blogs;
  }

  @Put(':id/bind-with-user/:userId')
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

  @Put(':id/ban')
  @BanBlogBySASwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanBlog(
    @Param('id') blogId: string,
    @Body() banStatusInputModel: BanOrUnbanBlogDto,
  ): Promise<void> {
    await this.commandBus.execute<BanOrUnbanBlogCommand>(
      new BanOrUnbanBlogCommand(blogId, banStatusInputModel.isBanned),
    );
    return;
  }
}
