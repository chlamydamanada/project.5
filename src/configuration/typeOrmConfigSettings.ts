import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { config } from 'dotenv';
config();
import { User } from '../modules/superAdmin/users/domain/user.entity';
import { BanInfo } from '../modules/superAdmin/users/domain/banInfo.entity';
import { EmailConfirmationInfo } from '../modules/superAdmin/users/domain/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from '../modules/superAdmin/users/domain/passwordRecoveryInfo.entity';
import { Device } from '../modules/public/devices/domain/device.entity';
import { Blog } from '../modules/bloggers/blogs/domain/blog.entity';
import { BlogBanInfo } from '../modules/bloggers/blogs/domain/blogBanInfo.entity';
import { BanList } from '../modules/bloggers/users/domain/banList.entity';
import { Post } from '../modules/bloggers/posts/domain/post.entity';
import { PostLikeStatus } from '../modules/public/likeStatus/domain/postLikeStatus.entity';
import { Comment } from '../modules/public/comments/domain/comment.entity';
import { CommentLikeStatus } from '../modules/public/likeStatus/domain/commentLikeStatus.entity';
import { Question } from '../modules/superAdmin/quizQuestions/domain/question.entity';
import { Game } from '../modules/public/quizGame/domain/game.entity';
import { DataSource } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { QuestionOfGame } from '../modules/public/quizGame/domain/questionOfGame.entity';
import { PlayerProgress } from '../modules/public/quizGame/domain/player.entity';
import { Answer } from '../modules/public/quizGame/domain/answer.entity';

export const typeOrmConfig: PostgresConnectionOptions = {
  name: 'default',
  type: 'postgres',
  url: process.env.DB_URL,
  ssl: true,
  entities: [
    User,
    BanInfo,
    EmailConfirmationInfo,
    PasswordRecoveryInfo,
    Device,
    Blog,
    BlogBanInfo,
    BanList,
    Post,
    PostLikeStatus,
    Comment,
    CommentLikeStatus,
    Question,
    Game,
    QuestionOfGame,
    PlayerProgress,
    Answer,
  ],
  synchronize: false,
  logging: false,
  //migrations: ['src/postgres/migrations/**/*{.ts,.js}'],
  migrations: [__dirname + '../postgres/migrations/**/*{.ts,.js'],
};

export default new DataSource(typeOrmConfig);

export const localTypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  //url: process.env.DB_URL,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432'),
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  //ssl: true,
  entities: [
    User,
    BanInfo,
    EmailConfirmationInfo,
    PasswordRecoveryInfo,
    Device,
    Blog,
    BlogBanInfo,
    BanList,
    Post,
    PostLikeStatus,
    Comment,
    CommentLikeStatus,
    Question,
    Game,
    QuestionOfGame,
    PlayerProgress,
    Answer,
  ],
  autoLoadEntities: true,
  synchronize: true,
  logging: false,
};
