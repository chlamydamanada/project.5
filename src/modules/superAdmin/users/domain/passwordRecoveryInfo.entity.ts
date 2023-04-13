import { JoinColumn, Column, Entity, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class PasswordRecoveryInfo {
  @OneToOne(() => User, (u) => u.passwordRecoveryInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @PrimaryColumn()
  userId: string;

  @Column()
  recoveryCode: string;

  @Column()
  expirationDate: Date;
}
