import { configModule } from './configuration/configModule'; //should be first in imports
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from './adapters/email/email.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { BcryptAdapter } from './adapters/bcrypt/bcryptAdapter';
import { SaController } from './modules/superAdmin/api/sa.controller';
import { CreateUserUseCase } from './modules/superAdmin/application/users.useCases/createUser.useCase';
import { UsersRepositoryToSA } from './modules/superAdmin/repositories/usersToSA.repository';
import { UsersQueryRepositoryToSA } from './modules/superAdmin/api/query.repositories/usersToSAQuery.repository';
import { User } from './modules/superAdmin/domain/users.entities/user.entity';
import { BanInfo } from './modules/superAdmin/domain/users.entities/banInfo.entity';
import { EmailConfirmationInfo } from './modules/superAdmin/domain/users.entities/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from './modules/superAdmin/domain/users.entities/passwordRecoveryInfo.entity';
import { DeleteUserUseCase } from './modules/superAdmin/application/users.useCases/deleteUser.useCase';
import { BanOrUnbanUserUseCase } from './modules/superAdmin/application/users.useCases/banOrUnbanUser.useCase';
import { Device } from './modules/public/devices/domain/device.entity';
import { AuthController } from './modules/public/auth/api/auth.controller';
import { CreateRTMetaUseCase } from './modules/public/auth/useCases/createRTMeta.useCase';
import { DevicesRepository } from './modules/public/devices/repositories/device.repository';
import { DevicesQueryRepository } from './modules/public/devices/api/queryRepositories/deviceQuery.repository';
import { JwtAdapter } from './adapters/jwt/jwtAdapter';
import { CheckCredentialsUseCase } from './modules/public/auth/useCases/checkCredentials.useCase';
import { UsersRepository } from './modules/public/auth/repositories/users.repository';
import { PasswordStrategy } from './modules/public/auth/strategies/pass.strategy';
import { UsersQueryRepository } from './modules/public/auth/repositories/usersQuery.repository';
import { UserRegistrationUseCase } from './modules/public/auth/useCases/userRegistration.useCase';
import { DevicesRepositoryToSA } from './modules/superAdmin/repositories/devicesToSA.repository';
import { AccessTokenStrategy } from './modules/public/auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './modules/public/auth/strategies/refreshToken.strategy';
import { DeleteAllDataController } from './modules/deleteAllData/deleteAllData.controller';
import { DevicesController } from './modules/public/devices/api/device.controller';
import { ChangePasswordUseCase } from './modules/public/auth/useCases/changePassword.useCase';
import { CheckEmailIsConfirmedUseCase } from './modules/public/auth/useCases/checkEmailIsConfirmed.useCase';
import { ConfirmEmailUseCase } from './modules/public/auth/useCases/confirmEmail.useCase';
import { CreateRecoveryCodeUseCase } from './modules/public/auth/useCases/createRecoveryCode.useCase';
import { UpdateRTMetaUseCase } from './modules/public/auth/useCases/updateRTMeta.useCase';
import { DeleteAllDevicesExceptThisUseCase } from './modules/public/devices/useCases/deleteAllDevicesExceptThis.useCase';
import { DeleteDeviceUseCase } from './modules/public/devices/useCases/deleteDevice.useCase';
import { ConfigService } from '@nestjs/config';
import { BloggerController } from './modules/bloggers/api/blogger.controller';
import { Blog } from './modules/bloggers/domain/blog.entity';
import { CreateBlogUseCase } from './modules/bloggers/application/blogs.useCases/createBlog.useCase';
import { BlogsToBloggerRepository } from './modules/bloggers/repositories/blogsToBlogger.repository';
import { BlogsToBloggerQueryRepository } from './modules/bloggers/api/query.repositories/blogsToBloggerQuery.repository';
import { PostsToBloggerQueryRepository } from './modules/bloggers/api/query.repositories/postsToBloggerQuery.repository';
import { UpdateBlogUseCase } from './modules/bloggers/application/blogs.useCases/updateBlog.useCase';
import { DeleteBlogUseCase } from './modules/bloggers/application/blogs.useCases/deleteBlog.useCase';
import { CreatePostUseCase } from './modules/bloggers/application/posts.useCases/createPost.useCase';
import { PostsToBloggerRepository } from './modules/bloggers/repositories/postsToBlogger.repository';
import { Post } from './modules/bloggers/domain/post.entity';
import { UpdatePostUseCase } from './modules/bloggers/application/posts.useCases/updatePost.useCase';
import { DeletePostUseCase } from './modules/bloggers/application/posts.useCases/deletePost.useCase';
import { BanList } from './modules/bloggers/domain/banStatus.entity';
import { BanOrUnbanUserByBloggerUseCase } from './modules/bloggers/application/users.useCases/banOrUnbanUserByBlogger.useCase';
import { UsersToBloggerRepository } from './modules/bloggers/repositories/usersToBlogger.repository';
import { UsersToBloggerQueryRepository } from './modules/bloggers/api/query.repositories/usersToBloggerQuery.repository';
import { BlogPublicController } from './modules/public/blogs/api/blogPublic.controller';
import { BlogPublicQueryRepository } from './modules/public/blogs/api/query.repositories/blogPublicQuery.repository';
import { PostPublicQueryRepository } from './modules/public/posts/api/query.repositories/postPublicQuery.repository';
import { PostPublicController } from './modules/public/posts/api/postPublic.controller';
import { BlogBanInfo } from './modules/bloggers/domain/blogBanInfo.entity';
import { BanOrUnbanBlogUseCase } from './modules/superAdmin/application/blogs.useCases/banOrUnbanBlog.useCase';
import { BlogsToSaRepository } from './modules/superAdmin/repositories/blogsToSa.repository';
import { BlogBindToUserUseCase } from './modules/superAdmin/application/blogs.useCases/blogBindToUser.useCase';
import { BlogsToSAQueryRepository } from './modules/superAdmin/api/query.repositories/blogsToSAQuery.repository';
import { CommentsPublicQueryRepository } from './modules/public/comments/api/query.repositories/commentsPublicQuery.repository';
import { PostsRepository } from './modules/public/posts/repositories/posts.repository';
import { CommentsRepository } from './modules/public/comments/repositories/comments.repository';
import { Comment } from './modules/public/comments/domain/comment.entity';
import { CreateCommentUseCase } from './modules/public/comments/useCases/createComment.useCase';
import { CommentsPublicController } from './modules/public/comments/api/comment.controller';
import { UpdateCommentUseCase } from './modules/public/comments/useCases/updateComment.useCase';
import { DeleteCommentUseCase } from './modules/public/comments/useCases/deleteComment.useCase';
import { CommentsToBloggerQueryRepository } from './modules/bloggers/api/query.repositories/commentsToBloggerQuery.repository';
import { PostLikeStatus } from './modules/public/likeStatus/domain/postLikeStatus.entity';
import { GeneratePostLikeStatusUseCase } from './modules/public/likeStatus/useCases/generatePostLikeStatus.useCase';
import { CommentLikeStatus } from './modules/public/likeStatus/domain/commentLikeStatus.entity';
import { GenerateCommentLikeStatusUseCase } from './modules/public/likeStatus/useCases/generateCommentLikeStatus.useCase';
//import { IsBlogExistValidator } from './helpers/validators/isBlogExistById.validator';

const repositories = [
  UsersRepositoryToSA,
  UsersQueryRepositoryToSA,
  UsersRepository,
  UsersQueryRepository,
  DevicesRepository,
  DevicesQueryRepository,
  DevicesRepositoryToSA,
  BlogsToSaRepository,
  BlogsToBloggerRepository,
  BlogsToBloggerQueryRepository,
  PostsToBloggerQueryRepository,
  PostsToBloggerRepository,
  UsersToBloggerRepository,
  UsersToBloggerQueryRepository,
  BlogPublicQueryRepository,
  PostPublicQueryRepository,
  BlogsToSAQueryRepository,
  CommentsPublicQueryRepository,
  PostsRepository,
  CommentsRepository,
  CommentsToBloggerQueryRepository,
];
const useCases = [
  BanOrUnbanUserUseCase,
  ChangePasswordUseCase,
  CheckCredentialsUseCase,
  CheckEmailIsConfirmedUseCase,
  ConfirmEmailUseCase,
  CreateRecoveryCodeUseCase,
  CreateRTMetaUseCase,
  CreateUserUseCase,
  DeleteAllDevicesExceptThisUseCase,
  DeleteDeviceUseCase,
  DeleteUserUseCase,
  UpdateRTMetaUseCase,
  UserRegistrationUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  BanOrUnbanUserByBloggerUseCase,
  BanOrUnbanBlogUseCase,
  BlogBindToUserUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  GeneratePostLikeStatusUseCase,
  GenerateCommentLikeStatusUseCase,
];
const strategies = [
  PasswordStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
];
const validators = [];
const adapters = [BcryptAdapter, JwtAdapter];

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_URL'),
        //host: configService.get('DB_HOST'),
        //port: parseInt(<string>configService.get('DB_PORT')),
        //username: configService.get('DB_USER_NAME'),
        //password: configService.get('DB_PASS'),
        //database: configService.get('DB_NAME'),
        // entities: [],
        ssl: true,
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      BanInfo,
      EmailConfirmationInfo,
      PasswordRecoveryInfo,
      Device,
      Blog,
      Post,
      BanList,
      BlogBanInfo,
      Comment,
      PostLikeStatus,
      CommentLikeStatus,
    ]),
    PassportModule,
    MailModule, // 📧
    JwtModule.register({}),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    CqrsModule,
  ],
  controllers: [
    AppController,
    AuthController,
    DeleteAllDataController,
    DevicesController,
    SaController,
    BloggerController,
    BlogPublicController,
    PostPublicController,
    CommentsPublicController,
  ],
  providers: [
    AppService,
    ...useCases,
    ...repositories,
    ...strategies,
    ...validators,
    ...adapters,
  ],
})
export class AppModule {}
