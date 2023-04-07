import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { EmailConfirmationInfo } from './emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from './passwordRecoveryInfo.entity';
import { BanInfo } from './banInfo.entity';
import { Blog } from '../../../bloggers/domain/blog.entity';
import { BanList } from '../../../bloggers/domain/banStatus.entity';
import { Comment } from '../../../public/comments/domain/comment.entity';
import { PostLikeStatus } from '../../../public/likeStatus/domain/postLikeStatus.entity';
import { CommentLikeStatus } from '../../../public/likeStatus/domain/commentLikeStatus.entity';
import { Device } from '../../../public/devices/domain/device.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => EmailConfirmationInfo, (e) => e.user)
  emailConfirmationInfo: EmailConfirmationInfo;

  @OneToOne(() => PasswordRecoveryInfo, (p) => p.user)
  passwordRecoveryInfo: PasswordRecoveryInfo;

  @OneToOne(() => BanInfo, (b) => b.user)
  banInfo: BanInfo;

  @OneToMany(() => Blog, (b) => b.blogger)
  blogs: Blog[];

  @OneToMany(() => BanList, (b) => b.user)
  banList: BanList[]; // should delete this relation?

  @OneToMany(() => Comment, (c) => c.user)
  comments: Comment[];

  @OneToMany(() => PostLikeStatus, (s) => s.user)
  statusOfPost: PostLikeStatus[];

  @OneToMany(() => CommentLikeStatus, (s) => s.user)
  statusOfComment: CommentLikeStatus[];

  @OneToMany(() => Device, (d) => d.owner)
  devices: Device[];
}
