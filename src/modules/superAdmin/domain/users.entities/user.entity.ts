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

  @OneToOne(() => EmailConfirmationInfo, (e) => e.user, {
    onDelete: 'CASCADE',
  })
  emailConfirmationInfo: EmailConfirmationInfo;

  @OneToOne(() => PasswordRecoveryInfo, (p) => p.user, {
    onDelete: 'CASCADE',
  })
  passwordRecoveryInfo: PasswordRecoveryInfo;

  @OneToOne(() => BanInfo, (b) => b.user, {
    onDelete: 'CASCADE',
  })
  banInfo: BanInfo;

  @OneToMany(() => Blog, (b) => b.blogger, {
    onDelete: 'CASCADE',
  })
  blogs: Blog[];

  @OneToMany(() => BanList, (b) => b.user, {
    onDelete: 'CASCADE',
  })
  banList: BanList[]; // should delete this relation?

  @OneToMany(() => Comment, (c) => c.user, {
    onDelete: 'CASCADE',
  })
  comments: Comment[];
}
