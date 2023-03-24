import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogPublicQueryRepository } from './query.repositories/blogPublicQuery.repository';
import { BlogQueryPipe } from './pipes/blogQueryPipe';
import { blogsViewType } from '../types/blogsViewType';
import { blogQueryType } from '../types/blogsQweryType';
import { blogViewType } from '../types/blogViewType';
import { PostPublicQueryRepository } from '../../posts/api/query.repositories/postPublicQuery.repository';
import { ExtractUserIdFromAT } from '../../auth/guards/extractUserIdFromAT.guard';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { postsViewType } from '../../posts/types/postsViewType';
import { postQueryType } from '../../posts/types/postsQueryType';
import { PostQueryPipe } from '../../posts/api/pipes/postQueryPipe';

@Controller('blogs')
export class BlogPublicController {
  constructor(
    private readonly blogQueryRepository: BlogPublicQueryRepository,
    private readonly postQueryRepository: PostPublicQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(@Query() query: BlogQueryPipe): Promise<blogsViewType> {
    const blogs = await this.blogQueryRepository.findAllBlogs(
      query as blogQueryType,
    );
    return blogs;
  }

  @Get(':id')
  async getBlogByBlogId(
    @Param('id')
    blogId: string,
  ): Promise<blogViewType> {
    const blog = await this.blogQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');
    return blog;
  }

  @Get(':blogId/posts')
  @UseGuards(ExtractUserIdFromAT)
  async getAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: PostQueryPipe,
    @CurrentUserId() userId: string | null,
  ): Promise<postsViewType> {
    const blog = await this.blogQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');

    const posts = await this.postQueryRepository.findAllPostsByBlogId(
      blogId,
      query as postQueryType,
      userId,
    );
    return posts;
  }
}
