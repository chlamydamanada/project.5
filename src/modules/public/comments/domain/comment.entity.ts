import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { Post } from '../../../bloggers/domain/post.entity';
import { PostLikeStatus } from '../../likeStatus/domain/postLikeStatus.entity';
import { CommentLikeStatus } from '../../likeStatus/domain/commentLikeStatus.entity';

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
