import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../posts/domain/post.entity';
import { BanList } from '../../users/domain/banList.entity';
import { BlogBanInfo } from './blogBanInfo.entity';
import { User } from '../../../superAdmin/users/domain/user.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  websiteUrl: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: false })
  isMembership: boolean;

  @Column()
  bloggerId: string;

  @ManyToOne(() => User, (u) => u.blogs, {
    onDelete: 'CASCADE',
  })
  blogger: User;

  @OneToMany(() => Post, (p) => p.blog)
  posts: Post[];

  @OneToMany(() => BanList, (b) => b.blog)
  banList: BanList[];

  @OneToOne(() => BlogBanInfo, (b) => b.blog)
  blogBanInfo: BlogBanInfo;
}
