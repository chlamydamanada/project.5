import { Module } from '@nestjs/common';
import { SaController } from './api/sa.controller';
import { BlogsToSAQueryRepository } from './api/query.repositories/blogsToSAQuery.repository';
import { UsersQueryRepositoryToSA } from './api/query.repositories/usersToSAQuery.repository';
import { QuestionsToSAQueryRepository } from './api/query.repositories/questionsToSAQuery.repository';
import { BlogBindToUserUseCase } from './application/blogs.useCases/blogBindToUser.useCase';
import { BlogsToSaRepository } from './repositories/blogsToSa.repository';
import { UsersRepositoryToSA } from './repositories/usersToSA.repository';
import { configModule } from '../../configuration/configModule';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateUserUseCase } from './application/users.useCases/createUser.useCase';
import { BcryptAdapter } from '../../adapters/bcrypt/bcryptAdapter';
import { DeleteUserUseCase } from './application/users.useCases/deleteUser.useCase';
import { BanOrUnbanUserUseCase } from './application/users.useCases/banOrUnbanUser.useCase';
import { DevicesRepositoryToSA } from './repositories/devicesToSA.repository';
import { BanOrUnbanBlogUseCase } from './application/blogs.useCases/banOrUnbanBlog.useCase';
import { CreateQuestionUseCase } from './application/quiz.useCases/createQuestion.useCase';
import { QuestionsToSARepository } from './repositories/questionsToSA.repository';
import { UpdateQuestionUseCase } from './application/quiz.useCases/updateQuestion.useCase';
import { PublishOrUnpublishQuestionUseCase } from './application/quiz.useCases/publishOrUnpublishQuestion.useCase';
import { DeleteQuestionUseCase } from './application/quiz.useCases/deleteQuestion.useCase';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './domain/users.entities/user.entity';
import { BanInfo } from './domain/users.entities/banInfo.entity';
import { EmailConfirmationInfo } from './domain/users.entities/emailConfirmationInfo.entity';
import { Device } from '../public/devices/domain/device.entity';
import { Question } from './domain/quizQuestions.entities/question.entity';
import { Blog } from '../bloggers/domain/blog.entity';
import { BlogBanInfo } from '../bloggers/domain/blogBanInfo.entity';
import { PasswordRecoveryInfo } from './domain/users.entities/passwordRecoveryInfo.entity';

const adapters = [BcryptAdapter];
const useCases = [
  BlogBindToUserUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
  BanOrUnbanUserUseCase,
  BanOrUnbanBlogUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishOrUnpublishQuestionUseCase,
  DeleteQuestionUseCase,
];
const repositories = [
  BlogsToSAQueryRepository,
  BlogsToSaRepository,
  UsersQueryRepositoryToSA,
  UsersRepositoryToSA,
  QuestionsToSAQueryRepository,
  QuestionsToSARepository,
  DevicesRepositoryToSA,
];

@Module({
  imports: [
    configModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      User,
      BanInfo,
      EmailConfirmationInfo,
      PasswordRecoveryInfo,
      Device,
      Question,
      Blog,
      BlogBanInfo,
    ]),
  ],
  controllers: [SaController],
  providers: [...useCases, ...repositories, ...adapters],
})
export class SuperAdminModule {}
