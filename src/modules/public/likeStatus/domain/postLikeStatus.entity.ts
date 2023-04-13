import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../../../bloggers/posts/domain/post.entity';
import { User } from '../../../superAdmin/users/domain/user.entity';

@Entity()
export class PostLikeStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: string;

  @ManyToOne(() => User, (u) => u.statusOfPost, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.status, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column()
  postId: string;
}
