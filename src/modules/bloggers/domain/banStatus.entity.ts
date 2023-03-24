import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';
import { User } from '../../superAdmin/domain/users.entities/user.entity';

@Entity()
export class BanList {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string;

  @ManyToOne(() => Blog, (b) => b.banList)
  blog: Blog;

  @Column()
  bloggerId: string;

  @Column()
  userId: string;

  @Column()
  userLogin: string;

  @ManyToOne(() => User, (u) => u.banList)
  user: User;

  @Column()
  banReason: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  banDate: Date;

  @Column({ type: 'boolean', default: true })
  isBanned: boolean;
}
