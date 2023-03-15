import { JoinColumn, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BanInfo {
  @OneToOne(() => User, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ nullable: true, default: null })
  banDate: string;

  @Column({ nullable: true, default: null })
  banReason: string;
}
