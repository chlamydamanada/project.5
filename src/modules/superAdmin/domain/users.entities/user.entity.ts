import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EmailConfirmationInfo } from './emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from './passwordRecoveryInfo.entity';
import { BanInfo } from './banInfo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToOne(() => EmailConfirmationInfo, (e) => e.user)
  emailConfirmationInfo: EmailConfirmationInfo;

  @OneToOne(() => PasswordRecoveryInfo, (p) => p.user)
  passwordRecoveryInfo: PasswordRecoveryInfo;

  @OneToOne(() => BanInfo, (b) => b.user)
  banInfo: BanInfo;
}
