import { config } from 'dotenv';
config();
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { DataSource } from 'typeorm';
import { User } from '../modules/superAdmin/users/domain/user.entity';
import { BanInfo } from '../modules/superAdmin/users/domain/banInfo.entity';
import { EmailConfirmationInfo } from '../modules/superAdmin/users/domain/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from '../modules/superAdmin/users/domain/passwordRecoveryInfo.entity';
import { Device } from '../modules/public/devices/domain/device.entity';
import { Blog } from '../modules/bloggers/blogs/domain/blog.entity';
import { Post } from '../modules/bloggers/posts/domain/post.entity';
import { BanList } from '../modules/bloggers/users/domain/banList.entity';
import { BlogBanInfo } from '../modules/bloggers/blogs/domain/blogBanInfo.entity';
import { Comment } from '../modules/public/comments/domain/comment.entity';
import { PostLikeStatus } from '../modules/public/likeStatus/domain/postLikeStatus.entity';
import { CommentLikeStatus } from '../modules/public/likeStatus/domain/commentLikeStatus.entity';
import { Question } from '../modules/superAdmin/quizQuestions/domain/question.entity';
import { Game } from '../modules/public/quizGame/domain/game.entity';
const url = process.env.DB_URL;

console.log('url', process.env.DB_URL);
export const typeOrmConfig: PostgresConnectionOptions = {
  name: 'default',
  url: url,
  type: 'postgres',
  //host: 'localhost',
  //port: 5432,
  //username: 'postgres',
  //password: 'sa',
  //database: 'project.5-db',
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
  ],
  synchronize: false,
  migrations: [__dirname + '\\migrations\\**\\*{.ts,.js}'],
};

export default new DataSource(typeOrmConfig);
