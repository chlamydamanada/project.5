import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';

@Entity()
export class Device {
  @PrimaryColumn()
  deviceId: string;

  @Column()
  deviceIp: string;

  @Column({ nullable: true })
  deviceTitle: string;

  @Column()
  lastActiveDate: number;

  @Column()
  expirationDate: number;

  @ManyToOne(() => User, (u) => u.banInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;
}
