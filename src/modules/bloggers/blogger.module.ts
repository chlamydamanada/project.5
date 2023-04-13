import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { configModule } from '../../configuration/configModule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from './blogs/domain/blog.entity';
import { BlogBanInfo } from './blogs/domain/blogBanInfo.entity';
import { Post } from './posts/domain/post.entity';
import { BanList } from './users/domain/banList.entity';
import { Comment } from '../public/comments/domain/comment.entity';
import { CommentLikeStatus } from '../public/likeStatus/domain/commentLikeStatus.entity';
import { BlogsToBloggerQueryRepository } from './blogs/api/query.repositories/blogsToBloggerQuery.repository';
import { PostsToBloggerQueryRepository } from './posts/api/query.repositories/postsToBloggerQuery.repository';
import { CommentsToBloggerQueryRepository } from './comments/api/query.repositories/commentsToBloggerQuery.repository';
import { CreateBlogUseCase } from './blogs/useCases/createBlog.useCase';
import { BlogsToBloggerRepository } from './blogs/repositories/blogsToBlogger.repository';
import { PostsToBloggerRepository } from './posts/repositories/postsToBlogger.repository';
import { CreatePostUseCase } from './posts/useCases/createPost.useCase';
import { UpdateBlogUseCase } from './blogs/useCases/updateBlog.useCase';
import { UpdatePostUseCase } from './posts/useCases/updatePost.useCase';
import { DeleteBlogUseCase } from './blogs/useCases/deleteBlog.useCase';
import { DeletePostUseCase } from './posts/useCases/deletePost.useCase';
import { UsersToBloggerRepository } from './users/repositories/usersToBlogger.repository';
import { UsersToBloggerController } from './users/api/usersToBlogger.controller';
import { BlogsToBloggerController } from './blogs/api/blogsToBlogger.controller';
import { BanOrUnbanUserByBloggerUseCase } from './users/useCases/banOrUnbanUserByBlogger.useCase';
import { UsersToBloggerQueryRepository } from './users/api/query.repositories/usersToBloggerQuery.repository';
import { User } from '../superAdmin/users/domain/user.entity';

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
  controllers: [UsersToBloggerController, BlogsToBloggerController],
  providers: [...useCases, ...repositories],
})
export class BloggerModule {}
