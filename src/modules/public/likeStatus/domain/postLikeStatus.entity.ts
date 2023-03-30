import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { reactionStatusType } from '../types/statusType';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { Post } from '../../../bloggers/domain/post.entity';

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
