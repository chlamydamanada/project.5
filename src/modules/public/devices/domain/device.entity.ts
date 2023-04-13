import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../superAdmin/users/domain/user.entity';

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

  @ManyToOne(() => User, (u) => u.devices, { onDelete: 'CASCADE' })
  @JoinColumn()
  owner: User;

  @Column()
  ownerId: string;
}
