import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
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
import { AccessTokenGuard } from '../../../public/auth/guards/accessTokenAuth.guard';
import { BlogsToBloggerQueryRepository } from './query.repositories/blogsToBloggerQuery.repository';
import { GetBloggersBlogsSwaggerDecorator } from '../../../../swagger/decorators/blogger/blogs/getBloggersBlogs.swagger.decorator';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { BlogsToBloggerViewModel } from '../types/blogsToBloggerViewModel';
import { BlogQueryToBloggerType } from '../types/blogQueryToBloggerType';
import { BlogsToBloggerQueryDto } from './pipes/blogsToBloggerQuery.dto';
import { CommandBus } from '@nestjs/cqrs';
import { blogCreateInputDto } from './pipes/blogCreateInput.dto';
import { UserInfoType } from '../../../public/auth/types/userInfoType';
import { CreateBlogSwaggerDecorator } from '../../../../swagger/decorators/blogger/blogs/createBlog.swagger.decorator';
import { CurrentUserInfo } from '../../../../helpers/decorators/currentUserIdAndLogin';
import { CreateBlogCommand } from '../useCases/createBlog.useCase';
import { BlogToBloggerViewModel } from '../types/blogToBloggerViewModel';
import { UpdateBlogCommand } from '../useCases/updateBlog.useCase';
import { UpdateBlogSwaggerDecorator } from '../../../../swagger/decorators/blogger/blogs/updateBlog.swager.decorator';
import { blogUpdateInputDto } from './pipes/blogUpdateInput.dto';
import { DeleteBlogCommand } from '../useCases/deleteBlog.useCase';
import { DeleteBlogSwaggerDecorator } from '../../../../swagger/decorators/blogger/blogs/deleteBlog.swagger.decorator';
import { postUpdateInputDto } from '../../posts/api/pipes/postUpdateInput.dto';
import { CreatePostSwaggerDecorator } from '../../../../swagger/decorators/blogger/posts/createPost.swagger.decorator';
import { CreatePostCommand } from '../../posts/useCases/createPost.useCase';
import { UpdatePostCommand } from '../../posts/useCases/updatePost.useCase';
import { commentQueryType } from '../../../public/comments/types/commentQueryType';
import { DeletePostCommand } from '../../posts/useCases/deletePost.useCase';
import { CommentsViewForBloggerModel } from '../../comments/types/commentsViewForBloggerModel';
import { postCreateInputDto } from '../../posts/api/pipes/postCreateInput.dto';
import { UpdatePostSwaggerDecorator } from '../../../../swagger/decorators/blogger/posts/updatePost.swagger.decorator';
import { GetBloggersCommentsSwaggerDecorator } from '../../../../swagger/decorators/blogger/comments/getBloggersComments.swagger.decorator';
import { DeletePostSwaggerDecorator } from '../../../../swagger/decorators/blogger/posts/deletePost.swagger.decorator';
import { CommentToBloggerQueryDto } from '../../comments/api/pipes/commentsToBloggerQuery.dto';
import { postViewModel } from '../../posts/types/postViewModel';
import { CommentsToBloggerQueryRepository } from '../../comments/api/query.repositories/commentsToBloggerQuery.repository';
import { PostsToBloggerQueryRepository } from '../../posts/api/query.repositories/postsToBloggerQuery.repository';

@ApiTags('Blogs | Posts | Comments')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('blogger/blogs')
export class BlogsToBloggerController {
  constructor(
    private readonly blogsQueryRepository: BlogsToBloggerQueryRepository,
    private readonly postsQueryRepository: PostsToBloggerQueryRepository,
    private readonly commentsQueryRepository: CommentsToBloggerQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
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

  @Post()
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

  @Put(':id')
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

  @Delete(':id')
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

  @Post(':blogId/posts')
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

  @Put(':blogId/posts/:postId')
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

  @Delete(':blogId/posts/:postId')
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
}
