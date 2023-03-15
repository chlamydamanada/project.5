import {
  JoinColumn,
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
  Generated,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class EmailConfirmationInfo {
  @OneToOne(() => User, (u) => u.emailConfirmationInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: string;

  @Column({ type: 'uuid' })
  @Generated('uuid')
  confirmationCode: string;

  @Column({ type: 'timestamptz', default: new Date() })
  expirationDate: Date;

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;
}
