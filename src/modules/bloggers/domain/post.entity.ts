import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blog } from './blog.entity';
import { Comment } from '../../public/comments/domain/comment.entity';
import { PostLikeStatus } from '../../public/likeStatus/domain/postLikeStatus.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  shortDescription: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column()
  blogId: string;

  @Column()
  blogName: string;

  @ManyToOne(() => Blog, (b) => b.posts)
  blog: Blog;

  @OneToMany(() => Comment, (c) => c.post, {
    onDelete: 'CASCADE',
  })
  comments: Comment[];

  @OneToMany(() => PostLikeStatus, (s) => s.post)
  status: PostLikeStatus[];
}
