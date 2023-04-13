import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { configModule } from '../../configuration/configModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './domain/blog.entity';
import { BlogBanInfo } from './domain/blogBanInfo.entity';
import { Post } from './domain/post.entity';
import { BanList } from './domain/banStatus.entity';
import { Comment } from '../public/comments/domain/comment.entity';
import { PostLikeStatus } from '../public/likeStatus/domain/postLikeStatus.entity';
import { CommentLikeStatus } from '../public/likeStatus/domain/commentLikeStatus.entity';
import { BlogsToBloggerQueryRepository } from './blogs/api/query.repositories/blogsToBloggerQuery.repository';
import { PostsToBloggerQueryRepository } from './api/query.repositories/postsToBloggerQuery.repository';
import { UsersToBloggerQueryRepository } from './api/query.repositories/usersToBloggerQuery.repository';
import { CommentsToBloggerQueryRepository } from './api/query.repositories/commentsToBloggerQuery.repository';
import { CreateBlogUseCase } from './application/blogs.useCases/createBlog.useCase';
import { BlogsToBloggerRepository } from './repositories/blogsToBlogger.repository';
import { PostsToBloggerRepository } from './repositories/postsToBlogger.repository';
import { CreatePostUseCase } from './application/posts.useCases/createPost.useCase';
import { UpdateBlogUseCase } from './application/blogs.useCases/updateBlog.useCase';
import { UpdatePostUseCase } from './application/posts.useCases/updatePost.useCase';
import { DeleteBlogUseCase } from './application/blogs.useCases/deleteBlog.useCase';
import { DeletePostUseCase } from './application/posts.useCases/deletePost.useCase';
import { BanOrUnbanUserByBloggerUseCase } from './application/users.useCases/banOrUnbanUserByBlogger.useCase';
import { UsersToBloggerRepository } from './repositories/usersToBlogger.repository';
import { User } from '../superAdmin/domain/users.entities/user.entity';
import { BloggerController } from './api/blogger.controller';

const useCases = [
  CreateBlogUseCase,
  DeleteBlogUseCase,
  UpdateBlogUseCase,
  UpdatePostUseCase,
  CreatePostUseCase,
  DeletePostUseCase,
  BanOrUnbanUserByBloggerUseCase,
];

const repositories = [
  BlogsToBloggerQueryRepository,
  BlogsToBloggerRepository,
  PostsToBloggerQueryRepository,
  PostsToBloggerRepository,
  UsersToBloggerQueryRepository,
  UsersToBloggerRepository,
  CommentsToBloggerQueryRepository,
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      Blog,
      Post,
      User,
      BanList,
      BlogBanInfo,
      Comment,
      CommentLikeStatus,
    ]),
  ],
  controllers: [BloggerController],
  providers: [...useCases, ...repositories],
})
export class BloggerModule {}
