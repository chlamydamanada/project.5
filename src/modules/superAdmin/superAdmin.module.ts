import { configModule } from '../../configuration/configModule';
import { Module } from '@nestjs/common';
import { BlogsToSAController } from './blogs/blogsToSA.controller';
import { QuizQuestionsToSAController } from './quizQuestions/api/quizQuestionsToSA.controller';
import { UsersToSAController } from './users/api/usersToSA.controller';
import { DeleteUserUseCase } from './users/useCases/deleteUser.useCase';
import { User } from './users/domain/user.entity';
import { PublishOrUnpublishQuestionUseCase } from './quizQuestions/useCases/publishOrUnpublishQuestion.useCase';
import { DeleteQuestionUseCase } from './quizQuestions/useCases/deleteQuestion.useCase';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogBindToUserUseCase } from './blogs/useCases/blogBindToUser.useCase';
import { UsersQueryRepositoryToSA } from './users/api/query.repositories/usersToSAQuery.repository';
import { CreateUserUseCase } from './users/useCases/createUser.useCase';
import { DevicesRepositoryToSA } from './users/repositories/devicesToSA.repository';
import { Question } from './quizQuestions/domain/question.entity';
import { Blog } from '../bloggers/blogs/domain/blog.entity';
import { QuestionsToSAQueryRepository } from './quizQuestions/api/query.repositories/questionsToSAQuery.repository';
import { BanOrUnbanUserUseCase } from './users/useCases/banOrUnbanUser.useCase';
import { BlogsToSAQueryRepository } from './blogs/api/query.repositories/blogsToSAQuery.repository';
import { QuestionsToSARepository } from './quizQuestions/repositories/questionsToSA.repository';
import { EmailConfirmationInfo } from './users/domain/emailConfirmationInfo.entity';
import { BcryptAdapter } from '../../adapters/bcrypt/bcryptAdapter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from '../public/devices/domain/device.entity';
import { CreateQuestionUseCase } from './quizQuestions/useCases/createQuestion.useCase';
import { BlogsToSaRepository } from './blogs/repositories/blogsToSa.repository';
import { UpdateQuestionUseCase } from './quizQuestions/useCases/updateQuestion.useCase';
import { BanInfo } from './users/domain/banInfo.entity';
import { BlogBanInfo } from '../bloggers/blogs/domain/blogBanInfo.entity';
import { PasswordRecoveryInfo } from './users/domain/passwordRecoveryInfo.entity';
import { UsersRepositoryToSA } from './users/repositories/usersToSA.repository';
import { BanOrUnbanBlogUseCase } from './blogs/useCases/banOrUnbanBlog.useCase';

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
  controllers: [
    BlogsToSAController,
    QuizQuestionsToSAController,
    UsersToSAController,
  ],
  providers: [...useCases, ...repositories, ...adapters],
})
export class SuperAdminModule {}
