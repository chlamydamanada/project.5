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
import { BlogsToBloggerQueryRepository } from './query.repositories/blogsToBloggerQuery.repository';
import { blogInputModelPipe } from './pipes/blogs.pipes/blogInputDto.pipe';
import { CurrentUserInfo } from '../../../helpers/decorators/currentUserIdAndLogin';
import { UserInfoType } from '../../public/auth/types/userInfoType';
import { CreateBlogCommand } from '../application/blogs.useCases/createBlog.useCase';
import { BlogToBloggerViewType } from '../types/blogs/blogToBloggerViewType';
import { UpdateBlogCommand } from '../application/blogs.useCases/updateBlog.useCase';
import { CurrentUserId } from '../../../helpers/decorators/currentUserId.decorator';
import { DeleteBlogCommand } from '../application/blogs.useCases/deleteBlog.useCase';
import { postViewType } from '../types/posts/postViewType';
import { postInputModelIdPipe } from './pipes/posts.pipes/postInputDtoPipe';
import { CreatePostCommand } from '../application/posts.useCases/createPost.useCase';
import { DeletePostCommand } from '../application/posts.useCases/deletePost.useCase';
import { UpdatePostCommand } from '../application/posts.useCases/updatePost.useCase';
import { BanStatusByBloggerPipe } from './pipes/users.pipes/banStatusByBloggerPipe';
import { BanOrUnbanUserByBloggerCommand } from '../application/users.useCases/banOrUnbanUserByBlogger.useCase';
import { UsersToBloggerQueryRepository } from './query.repositories/usersToBloggerQuery.repository';
import { BannedUsersForBlogType } from '../types/users/bannedUsersForBlogType';
import { BannedUserQueryDtoPipe } from './pipes/users.pipes/bannedUserQueryDtoPipe';
import { BannedUserQueryDtoType } from '../types/users/bannedUserQueryDtoType';
import { BlogQueryPipe } from './pipes/blogs.pipes/blogQuery.pipe';
import { BlogQueryToBloggerType } from '../types/blogs/blogQueryToBloggerType';
import { BlogsToBloggerViewType } from '../types/blogs/blogsToBloggerViewType';
import { CommentQueryPipe } from '../../public/comments/api/pipes/commentQueryPipe';
import { CommentsViewForBloggerType } from '../types/comments/commentsViewForBloggerType';
import { commentQueryType } from '../../public/comments/types/commentQueryType';
import { CommentsToBloggerQueryRepository } from './query.repositories/commentsToBloggerQuery.repository';

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
  async getAllOwnerBlogs(
    @CurrentUserId() bloggerId: string,
    @Query() query: BlogQueryPipe,
  ): Promise<BlogsToBloggerViewType> {
    const blogs = await this.blogsQueryRepository.getAllBlogs(
      bloggerId,
      query as BlogQueryToBloggerType,
    );
    if (!blogs) throw new NotFoundException('You haven`t any blog');
    return blogs;
  }

  @Get('blogs/comments')
  async getAllCommentsForAllPost(
    @CurrentUserId() bloggerId: string,
    @Query() query: CommentQueryPipe,
  ): Promise<CommentsViewForBloggerType> {
    const comments =
      await this.commentsQueryRepository.findAllCommentsForAllPosts(
        bloggerId,
        query as commentQueryType,
      );
    if (!comments) throw new NotFoundException('You haven`t any comments');
    return comments;
  }

  @Post('blogs')
  async createBlog(
    @Body() blogInputModel: blogInputModelPipe,
    @CurrentUserInfo() userInfo: UserInfoType,
  ): Promise<BlogToBloggerViewType> {
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
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() postInputModel: postInputModelIdPipe,
    @CurrentUserId() bloggerId: string,
  ): Promise<postViewType> {
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
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() blogInputModel: blogInputModelPipe,
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
  @HttpCode(204)
  async updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() postInputDto: postInputModelIdPipe,
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
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('userId') userId: string,
    @CurrentUserId() bloggerId: string,
    @Body() banUserInputDto: BanStatusByBloggerPipe,
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
  async getBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() query: BannedUserQueryDtoPipe,
    @CurrentUserId() bloggerId: string,
  ): Promise<BannedUsersForBlogType> {
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
