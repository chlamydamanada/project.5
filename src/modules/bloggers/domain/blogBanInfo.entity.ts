import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Blog } from './blog.entity';

@Entity()
export class BlogBanInfo {
  @OneToOne(() => Blog, (b) => b.blogBanInfo)
  @JoinColumn()
  blog: Blog;

  @PrimaryColumn()
  blogId: string;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: String, nullable: true, default: null })
  banDate: string | null;
}
