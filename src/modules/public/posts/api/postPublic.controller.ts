import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostPublicQueryRepository } from './query.repositories/postPublicQuery.repository';
import { ExtractUserIdFromAT } from '../../auth/guards/extractUserIdFromAT.guard';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { postViewType } from '../types/postViewType';
import { PostQueryPipe } from './pipes/postQueryPipe';
import { postQueryType } from '../types/postsQueryType';

@Controller('posts')
export class PostPublicController {
  constructor(
    private readonly postQueryRepository: PostPublicQueryRepository,
  ) {}

  @Get()
  @UseGuards(ExtractUserIdFromAT)
  async getAllPosts(
    @Query() query: PostQueryPipe,
    @CurrentUserId() userId: string | null,
  ) {
    const posts = await this.postQueryRepository.findAllPosts(
      query as postQueryType,
      userId,
    );
    return posts;
  }

  @Get(':id')
  @UseGuards(ExtractUserIdFromAT)
  async getPostByPostId(
    @Param('id') postId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<postViewType> {
    const post = await this.postQueryRepository.findPostByPostId(
      postId,
      userId,
    );
    if (!post) throw new NotFoundException('Post with this id does not exist');
    return post;
  }
}
