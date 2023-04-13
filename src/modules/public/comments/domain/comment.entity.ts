import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from '../../../bloggers/posts/domain/post.entity';
import { CommentLikeStatus } from '../../likeStatus/domain/commentLikeStatus.entity';
import { User } from '../../../superAdmin/users/domain/user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.comments, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @ManyToOne(() => Post, (p) => p.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column()
  postId: string;

  @OneToMany(() => CommentLikeStatus, (s) => s.comment)
  status: CommentLikeStatus[];
}
