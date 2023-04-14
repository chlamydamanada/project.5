import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BlogPublicQueryRepository } from './query.repositories/blogPublicQuery.repository';
import { BlogQueryDto } from './pipes/blogQuery.dto';
import { blogsViewModel } from '../types/blogsViewModel';
import { blogQueryType } from '../types/blogsQueryType';
import { blogViewModel } from '../types/blogViewModel';
import { PostPublicQueryRepository } from '../../posts/api/query.repositories/postPublicQuery.repository';
import { ExtractUserIdFromAT } from '../../auth/guards/extractUserIdFromAT.guard';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { postsViewModel } from '../../posts/types/postsViewModel';
import { postQueryType } from '../../posts/types/postsQueryType';
import { PostsQueryDto } from '../../posts/api/pipes/postsQuery.dto';
import { ApiTags } from '@nestjs/swagger';
import { GetAllBlogsSwaggerDecorator } from '../../../../swagger/decorators/public/blogs/getAllBlogs.swagger.decorator';
import { GetBlogByIdSwaggerDecorator } from '../../../../swagger/decorators/public/blogs/getBlogById.swagger.decorator';
import { GetAllPostsByBlogIdSwaggerDecorator } from '../../../../swagger/decorators/public/blogs/getAllPostsByBlogId.swagger.decorator';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogPublicController {
  constructor(
    private readonly blogQueryRepository: BlogPublicQueryRepository,
    private readonly postQueryRepository: PostPublicQueryRepository,
  ) {}

  @Get()
  @GetAllBlogsSwaggerDecorator()
  async getAllBlogs(@Query() query: BlogQueryDto): Promise<blogsViewModel> {
    const blogs = await this.blogQueryRepository.findAllBlogs(
      query as blogQueryType,
    );
    return blogs;
  }

  @Get(':id')
  @GetBlogByIdSwaggerDecorator()
  async getBlogByBlogId(
    @Param('id')
    blogId: string,
  ): Promise<blogViewModel> {
    const blog = await this.blogQueryRepository.findBlogById(blogId);
    if (!blog) throw new NotFoundException('Blog with this id does not exist');
    return blog;
  }

  @Get(':blogId/posts')
  @GetAllPostsByBlogIdSwaggerDecorator()
  @UseGuards(ExtractUserIdFromAT)
  async getAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: PostsQueryDto,
    @CurrentUserId() userId: string | null,
  ): Promise<postsViewModel> {
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
