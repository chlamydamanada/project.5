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
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Blog {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  name: string;

  @ApiProperty()
  @Column()
  description: string;

  @ApiProperty()
  @Column()
  websiteUrl: string;

  @ApiProperty()
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty()
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
