import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { Comment } from '../../comments/domain/comment.entity';

@Entity()
export class CommentLikeStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: string;

  @ManyToOne(() => User, (u) => u.statusOfComment, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Comment, (c) => c.status, {
    onDelete: 'CASCADE',
  })
  comment: Comment;

  @Column()
  commentId: string;
}
