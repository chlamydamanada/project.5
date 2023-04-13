import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../public/auth/guards/accessTokenAuth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { PostsToBloggerQueryRepository } from './query.repositories/postsToBloggerQuery.repository';
import { BlogsToBloggerQueryRepository } from '../blogs/api/query.repositories/blogsToBloggerQuery.repository';
import { blogCreateInputDto } from '../blogs/api/pipes/blogCreateInput.dto';
import { CurrentUserInfo } from '../../../helpers/decorators/currentUserIdAndLogin';
import { UserInfoType } from '../../public/auth/types/userInfoType';
import { CreateBlogCommand } from '../application/blogs.useCases/createBlog.useCase';
import { BlogToBloggerViewModel } from '../types/blogs/blogToBloggerViewModel';
import { UpdateBlogCommand } from '../application/blogs.useCases/updateBlog.useCase';
import { CurrentUserId } from '../../../helpers/decorators/currentUserId.decorator';
import { DeleteBlogCommand } from '../application/blogs.useCases/deleteBlog.useCase';
import { postViewModel } from '../types/posts/postViewModel';
import { postCreateInputDto } from './pipes/posts.pipes/postCreateInput.dto';
import { CreatePostCommand } from '../application/posts.useCases/createPost.useCase';
import { DeletePostCommand } from '../application/posts.useCases/deletePost.useCase';
import { UpdatePostCommand } from '../application/posts.useCases/updatePost.useCase';
import { BanUserByBloggerInputDto } from './pipes/users.pipes/banUserByBloggerInput.dto';
import { BanOrUnbanUserByBloggerCommand } from '../application/users.useCases/banOrUnbanUserByBlogger.useCase';
import { UsersToBloggerQueryRepository } from './query.repositories/usersToBloggerQuery.repository';
import { BannedUsersForBlogModel } from '../types/users/bannedUsersForBlogModel';
import { BannedUserToBloggerQueryDto } from './pipes/users.pipes/bannedUserToBloggerQuery.dto';
import { BannedUserQueryDtoType } from '../types/users/bannedUserQueryDtoType';
import { BlogsToBloggerQueryDto } from '../blogs/api/pipes/blogsToBloggerQuery.dto';
import { BlogQueryToBloggerType } from '../types/blogs/blogQueryToBloggerType';
import { BlogsToBloggerViewModel } from '../types/blogs/blogsToBloggerViewModel';
import { CommentsViewForBloggerModel } from '../types/comments/commentsViewForBloggerModel';
import { commentQueryType } from '../../public/comments/types/commentQueryType';
import { CommentsToBloggerQueryRepository } from './query.repositories/commentsToBloggerQuery.repository';
import { CommentToBloggerQueryDto } from './pipes/comments.pipes/commentsToBloggerQuery.dto';
import { blogUpdateInputDto } from '../blogs/api/pipes/blogUpdateInput.dto';
import { postUpdateInputDto } from './pipes/posts.pipes/postUpdateInput.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateBlogSwaggerDecorator } from '../../../swagger/decorators/blogger/blogs/createBlog.swagger.decorator';
import { GetBloggersBlogsSwaggerDecorator } from '../../../swagger/decorators/blogger/blogs/getBloggersBlogs.swagger.decorator';
import { UpdateBlogSwaggerDecorator } from '../../../swagger/decorators/blogger/blogs/updateBlog.swager.decorator';
import { DeleteBlogSwaggerDecorator } from '../../../swagger/decorators/blogger/blogs/deleteBlog.swagger.decorator';
import { GetBloggersCommentsSwaggerDecorator } from '../../../swagger/decorators/blogger/comments/getBloggersComments.swagger.decorator';
import { CreatePostSwaggerDecorator } from '../../../swagger/decorators/blogger/posts/createPost.swagger.decorator';
import { UpdatePostSwaggerDecorator } from '../../../swagger/decorators/blogger/posts/updatePost.swagger.decorator';
import { DeletePostSwaggerDecorator } from '../../../swagger/decorators/blogger/posts/deletePost.swagger.decorator';
import { BanUserByBloggerSwaggerDecorator } from '../../../swagger/decorators/blogger/users/banUserByBlogger.swagger.decorator';
import { GetBloggersBannedUsersSwaggerDecorator } from '../../../swagger/decorators/blogger/users/getBloggersBannedUsers.swagger.decorator';

@ApiTags('Blogger')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('blogger')
export class BloggerController {
  constructor(
    private readonly blogsQueryRepository: BlogsToBloggerQueryRepository,
    private readonly postsQueryRepository: PostsToBloggerQueryRepository,
    private readonly bloggerQueryRepository: UsersToBloggerQueryRepository,
    private readonly commentsQueryRepository: CommentsToBloggerQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get('blogs')
  @GetBloggersBlogsSwaggerDecorator()
  async getAllOwnerBlogs(
    @CurrentUserId() bloggerId: string,
    @Query() query: BlogsToBloggerQueryDto,
  ): Promise<BlogsToBloggerViewModel> {
    const blogs = await this.blogsQueryRepository.getAllBlogs(
      bloggerId,
      query as BlogQueryToBloggerType,
    );
    return blogs;
  }

  @Get('blogs/comments')
  @GetBloggersCommentsSwaggerDecorator()
  async getAllCommentsForAllPost(
    @CurrentUserId() bloggerId: string,
    @Query() query: CommentToBloggerQueryDto,
  ): Promise<CommentsViewForBloggerModel> {
    const comments =
      await this.commentsQueryRepository.findAllCommentsForAllPosts(
        bloggerId,
        query as commentQueryType,
      );
    return comments;
  }

  @Post('blogs')
  @CreateBlogSwaggerDecorator()
  async createBlog(
    @Body() blogInputModel: blogCreateInputDto,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<BlogToBloggerViewModel> {
    const newBlogId: string = await this.commandBus.execute<
      CreateBlogCommand,
      string
    >(
      new CreateBlogCommand(
        userInfo.id,
        blogInputModel.name,
        blogInputModel.description,
        blogInputModel.websiteUrl,
      ),
    );
    const newBlog = await this.blogsQueryRepository.getBlogByBlogId(newBlogId);
    return newBlog!;
  }

  @Post('blogs/:blogId/posts')
  @CreatePostSwaggerDecorator()
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() postInputModel: postCreateInputDto,
    @CurrentUserId() bloggerId: string,
  ): Promise<postViewModel> {
    const newPostId = await this.commandBus.execute<CreatePostCommand, string>(
      new CreatePostCommand(
        blogId,
        bloggerId,
        postInputModel.title,
        postInputModel.content,
        postInputModel.shortDescription,
      ),
    );
    const newPost = await this.postsQueryRepository.getPostByPostId(newPostId);
    return newPost!;
  }

  @Put('blogs/:id')
  @UpdateBlogSwaggerDecorator()
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() blogInputModel: blogUpdateInputDto,
    @CurrentUserId() bloggerId: string,
  ): Promise<void> {
    await this.commandBus.execute<UpdateBlogCommand>(
      new UpdateBlogCommand(
        blogId,
        bloggerId,
        blogInputModel.name,
        blogInputModel.description,
        blogInputModel.websiteUrl,
      ),
    );
    return;
  }

  @Put('blogs/:blogId/posts/:postId')
  @UpdatePostSwaggerDecorator()
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postInputDto: postUpdateInputDto,
    @CurrentUserId() bloggerId: string,
  ): Promise<void> {
    await this.commandBus.execute<UpdatePostCommand>(
      new UpdatePostCommand(
        postId,
        blogId,
        bloggerId,
        postInputDto.title,
        postInputDto.content,
        postInputDto.shortDescription,
      ),
    );
    return;
  }

  @Delete('blogs/:id')
  @DeleteBlogSwaggerDecorator()
  @HttpCode(204)
  async deleteBlogByBlogId(
    @Param('id') blogId: string,
    @CurrentUserId() bloggerId: string,
  ): Promise<void> {
    await this.commandBus.execute<DeleteBlogCommand>(
      new DeleteBlogCommand(blogId, bloggerId),
    );
    return;
  }

  @Delete('blogs/:blogId/posts/:postId')
  @DeletePostSwaggerDecorator()
  @HttpCode(204)
  async deletePostByPostId(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @CurrentUserId() bloggerId: string,
  ): Promise<void> {
    await this.commandBus.execute<DeletePostCommand>(
      new DeletePostCommand(postId, blogId, bloggerId),
    );
    return;
  }

  @Put('users/:userId/ban')
  @BanUserByBloggerSwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('userId') userId: string,
    @CurrentUserId() bloggerId: string,
    @Body() banUserInputDto: BanUserByBloggerInputDto,
  ): Promise<void> {
    await this.commandBus.execute<BanOrUnbanUserByBloggerCommand>(
      new BanOrUnbanUserByBloggerCommand(
        userId,
        bloggerId,
        banUserInputDto.isBanned,
        banUserInputDto.banReason,
        banUserInputDto.blogId,
      ),
    );
    return;
  }

  @Get('users/blog/:blogId')
  @GetBloggersBannedUsersSwaggerDecorator()
  async getBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() query: BannedUserToBloggerQueryDto,
    @CurrentUserId() bloggerId: string,
  ): Promise<BannedUsersForBlogModel> {
    //check is blogger owner of this blog
    const blog = await this.blogsQueryRepository.getOwnerIdOfBlog(blogId);
    if (!blog)
      throw new NotFoundException('The blog with this id doesn`t exist');
    if (bloggerId !== blog?.bloggerId)
      throw new ForbiddenException('You aren`t owner of this blog');
    //find banned users for this blog
    const bannedUsers =
      await this.bloggerQueryRepository.findBannedUsersForBlog(
        blogId,
        query as BannedUserQueryDtoType,
      );
    if (!bannedUsers)
      throw new NotFoundException('You haven`t any banned users');
    return bannedUsers;
  }
}
