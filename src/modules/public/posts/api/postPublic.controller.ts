import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostPublicQueryRepository } from './query.repositories/postPublicQuery.repository';
import { ExtractUserIdFromAT } from '../../auth/guards/extractUserIdFromAT.guard';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { postViewModel } from '../types/postViewModel';
import { PostsQueryDto } from './pipes/postsQuery.dto';
import { postQueryType } from '../types/postsQueryType';
import { AccessTokenGuard } from '../../auth/guards/accessTokenAuth.guard';
import { commentCreateInputDto } from '../../comments/api/pipes/commentCreateInput.dto';
import { CommentsPublicQueryRepository } from '../../comments/api/query.repositories/commentsPublicQuery.repository';
import { CommentViewModel } from '../../comments/types/commentViewModel';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/useCases/createComment.useCase';
import { CommentQueryDto } from '../../comments/api/pipes/commentQuery.dto';
import { CommentsViewModel } from '../../comments/types/commentsViewModel';
import { commentQueryType } from '../../comments/types/commentQueryType';
import { postsViewModel } from '../types/postsViewModel';
import { CurrentUserInfo } from '../../../../helpers/decorators/currentUserIdAndLogin';
import { UserInfoType } from '../../auth/types/userInfoType';
import { LikeStatusDto } from '../../likeStatus/pipes/likeStatus.dto';
import { GeneratePostLikeStatusCommand } from '../../likeStatus/useCases/generatePostLikeStatus.useCase';
import { ApiTags } from '@nestjs/swagger';
import { GetAllPostsSwaggerDecorator } from '../../../../swagger/decorators/public/posts/getAllPosts.swagger.decorator';
import { GetPostByIdSwaggerDecorator } from '../../../../swagger/decorators/public/posts/getPostById.swagger.decorator';
import { GetAllCommentsByPostIdSwaggerDecorator } from '../../../../swagger/decorators/public/posts/getAllCommentsByPostId.swagger.decorator';
import { CreateCommentByPostIdSwaggerDecorator } from '../../../../swagger/decorators/public/posts/createCommentByPostId.swagger.decorator';
import { UpdateLikeStatusOfPostSwaggerDecorator } from '../../../../swagger/decorators/public/posts/updateLikeStatusOfPost.swagger.decorator';

@ApiTags('Public Posts')
@Controller('posts')
export class PostPublicController {
  constructor(
    private readonly postQueryRepository: PostPublicQueryRepository,
    private readonly commentQueryRepository: CommentsPublicQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @GetAllPostsSwaggerDecorator()
  @UseGuards(ExtractUserIdFromAT)
  async getAllPosts(
    @Query() query: PostsQueryDto,
    @CurrentUserId() userId: string | null,
  ): Promise<postsViewModel> {
    const posts = await this.postQueryRepository.findAllPosts(
      query as postQueryType,
      userId,
    );
    return posts;
  }

  @Get(':id')
  @GetPostByIdSwaggerDecorator()
  @UseGuards(ExtractUserIdFromAT)
  async getPostByPostId(
    @Param('id') postId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<postViewModel> {
    const post = await this.postQueryRepository.findPostByPostId(
      postId,
      userId,
    );
    if (!post) throw new NotFoundException('Post with this id does not exist');
    return post;
  }

  @Get(':postId/comments')
  @GetAllCommentsByPostIdSwaggerDecorator()
  @UseGuards(ExtractUserIdFromAT)
  async getAllCommentsByPostId(
    @Param('postId') postId: string,
    @Query() query: CommentQueryDto,
    @CurrentUserId() userId: string | null,
  ): Promise<CommentsViewModel> {
    const post = await this.postQueryRepository.findPostByPostId(postId);
    if (!post) throw new NotFoundException('Post with this id does not exist');
    const allComments =
      await this.commentQueryRepository.getAllCommentsByPostId(
        postId,
        query as commentQueryType,
        userId,
      );
    return allComments;
  }

  @Post(':postId/comments')
  @CreateCommentByPostIdSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() commentInputDto: commentCreateInputDto,
    @CurrentUserId() userId: string,
  ): Promise<CommentViewModel> {
    const commentId = await this.commandBus.execute<
      CreateCommentCommand,
      string
    >(new CreateCommentCommand(postId, commentInputDto.content, userId));
    const comment = await this.commentQueryRepository.getCommentByCommentId(
      commentId,
    );
    return comment!;
  }

  @Put(':id/like-status')
  @UpdateLikeStatusOfPostSwaggerDecorator()
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  async updatePostStatusById(
    @Param('id') postId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() statusDto: LikeStatusDto,
  ): Promise<void> {
    await this.commandBus.execute<GeneratePostLikeStatusCommand>(
      new GeneratePostLikeStatusCommand(
        postId,
        userInfo.id,
        statusDto.likeStatus,
      ),
    );
    return;
  }
}
