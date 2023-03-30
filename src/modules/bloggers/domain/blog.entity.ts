import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../superAdmin/domain/users.entities/user.entity';
import { Post } from './post.entity';
import { BanList } from './banStatus.entity';
import { BlogBanInfo } from './blogBanInfo.entity';

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

  @ManyToOne(() => User, (u) => u.blogs)
  blogger: User;

  @OneToMany(() => Post, (p) => p.blog, {
    onDelete: 'CASCADE',
  })
  posts: Post[];

  @OneToMany(() => BanList, (b) => b.blog, {
    onDelete: 'CASCADE',
  })
  banList: BanList[];

  @OneToOne(() => BlogBanInfo, (b) => b.blog, {
    onDelete: 'CASCADE',
  })
  blogBanInfo: BlogBanInfo;
}
