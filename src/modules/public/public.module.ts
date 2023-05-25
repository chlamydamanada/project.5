import { Module } from '@nestjs/common';
import { configModule } from '../../configuration/configModule';
import { CqrsModule } from '@nestjs/cqrs';
import { MailModule } from '../../adapters/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './devices/domain/device.entity';
import { Blog } from '../bloggers/blogs/domain/blog.entity';
import { Post } from '../bloggers/posts/domain/post.entity';
import { BanList } from '../bloggers/users/domain/banList.entity';
import { BlogBanInfo } from '../bloggers/blogs/domain/blogBanInfo.entity';
import { Comment } from './comments/domain/comment.entity';
import { PostLikeStatus } from './likeStatus/domain/postLikeStatus.entity';
import { CommentLikeStatus } from './likeStatus/domain/commentLikeStatus.entity';
import { AuthController } from './auth/api/auth.controller';
import { DevicesController } from './devices/api/device.controller';
import { BlogPublicController } from './blogs/api/blogPublic.controller';
import { PostPublicController } from './posts/api/postPublic.controller';
import { CommentsPublicController } from './comments/api/comment.controller';
import { ChangePasswordUseCase } from './auth/useCases/changePassword.useCase';
import { CheckCredentialsUseCase } from './auth/useCases/checkCredentials.useCase';
import { CheckEmailIsConfirmedUseCase } from './auth/useCases/checkEmailIsConfirmed.useCase';
import { ConfirmEmailUseCase } from './auth/useCases/confirmEmail.useCase';
import { CreateRecoveryCodeUseCase } from './auth/useCases/createRecoveryCode.useCase';
import { CreateRTMetaUseCase } from './auth/useCases/createRTMeta.useCase';
import { DeleteAllDevicesExceptThisUseCase } from './devices/useCases/deleteAllDevicesExceptThis.useCase';
import { DeleteDeviceUseCase } from './devices/useCases/deleteDevice.useCase';
import { UpdateRTMetaUseCase } from './auth/useCases/updateRTMeta.useCase';
import { UserRegistrationUseCase } from './auth/useCases/userRegistration.useCase';
import { CreateCommentUseCase } from './comments/useCases/createComment.useCase';
import { UpdateCommentUseCase } from './comments/useCases/updateComment.useCase';
import { DeleteCommentUseCase } from './comments/useCases/deleteComment.useCase';
import { GeneratePostLikeStatusUseCase } from './likeStatus/useCases/generatePostLikeStatus.useCase';
import { GenerateCommentLikeStatusUseCase } from './likeStatus/useCases/generateCommentLikeStatus.useCase';
import { BcryptAdapter } from '../../adapters/bcrypt/bcryptAdapter';
import { JwtAdapter } from '../../adapters/jwt/jwtAdapter';
import { PasswordStrategy } from './auth/strategies/pass.strategy';
import { AccessTokenStrategy } from './auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './auth/strategies/refreshToken.strategy';
import { UsersRepository } from './auth/repositories/users.repository';
import { UsersQueryRepository } from './auth/api/query.repositories/usersQuery.repository';
import { DevicesRepository } from './devices/repositories/device.repository';
import { DevicesQueryRepository } from './devices/api/queryRepositories/deviceQuery.repository';
import { BlogPublicQueryRepository } from './blogs/api/query.repositories/blogPublicQuery.repository';
import { PostPublicQueryRepository } from './posts/api/query.repositories/postPublicQuery.repository';
import { CommentsPublicQueryRepository } from './comments/api/query.repositories/commentsPublicQuery.repository';
import { PostsRepository } from './posts/repositories/posts.repository';
import { CommentsRepository } from './comments/repositories/comments.repository';
import { User } from '../superAdmin/users/domain/user.entity';
import { EmailConfirmationInfo } from '../superAdmin/users/domain/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from '../superAdmin/users/domain/passwordRecoveryInfo.entity';
import { BanInfo } from '../superAdmin/users/domain/banInfo.entity';
import { Game } from './quizGame/domain/game.entity';
import { Answer } from './quizGame/domain/answer.entity';
import { QuestionOfGame } from './quizGame/domain/questionOfGame.entity';
import { PlayerProgress } from './quizGame/domain/player.entity';
import { Question } from '../superAdmin/quizQuestions/domain/question.entity';
import { QuizGamePublicController } from './quizGame/api/quizGame.controller';
import { QuizGamePublicRepository } from './quizGame/repositories/quizGame.repository';
import { QuizGamePublicQueryRepository } from './quizGame/api/query.repositories/quizGameQuery.repository';
import { ConnectionToGameUseCase } from './quizGame/useCases/connectionToGame.useCase';
import { CreateAnswerOfCurrentUserUseCase } from './quizGame/useCases/createAnswerOfCurrentUser.useCase';
import { FinishGamesInFewSecondsUseCase } from './quizGame/useCases/finishGamesInFewSeconds.useCase';

const useCases = [
  ChangePasswordUseCase,
  CheckCredentialsUseCase,
  CheckEmailIsConfirmedUseCase,
  ConfirmEmailUseCase,
  CreateRecoveryCodeUseCase,
  CreateRTMetaUseCase,
  DeleteAllDevicesExceptThisUseCase,
  DeleteDeviceUseCase,
  UpdateRTMetaUseCase,
  UserRegistrationUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  GeneratePostLikeStatusUseCase,
  GenerateCommentLikeStatusUseCase,
  ConnectionToGameUseCase,
  CreateAnswerOfCurrentUserUseCase,
  FinishGamesInFewSecondsUseCase,
];

const repositories = [
  UsersRepository,
  UsersQueryRepository,
  DevicesRepository,
  DevicesQueryRepository,
  BlogPublicQueryRepository,
  PostPublicQueryRepository,
  CommentsPublicQueryRepository,
  PostsRepository,
  CommentsRepository,
  QuizGamePublicRepository,
  QuizGamePublicQueryRepository,
];

const strategies = [
  PasswordStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
];

const adapters = [BcryptAdapter, JwtAdapter];

@Module({
  imports: [
    configModule,
    CqrsModule,
    MailModule,
    JwtModule.register({}),
    PassportModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
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
      Game,
      Answer,
      QuestionOfGame,
      PlayerProgress,
      Question,
    ]),
  ],
  controllers: [
    AuthController,
    DevicesController,
    BlogPublicController,
    PostPublicController,
    CommentsPublicController,
    QuizGamePublicController,
  ],
  providers: [...useCases, ...repositories, ...adapters, ...strategies],
})
export class PublicModule {}
