import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { Post } from '../../../bloggers/domain/post.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.comments)
  user: User;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @ManyToOne(() => Post, (p) => p.comments)
  post: Post;

  @Column()
  postId: string;
}
