import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Blog } from './blog.entity';

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
}
