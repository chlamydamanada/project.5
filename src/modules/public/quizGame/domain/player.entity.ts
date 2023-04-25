import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../../superAdmin/users/domain/user.entity';
import { Answer } from './answer.entity';
import { Game } from './game.entity';

@Entity()
export class PlayerProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @OneToOne(() => Game)
  game: Game;

  @Column({ type: 'uuid' })
  playerId: string; //userId

  @ManyToOne(() => User)
  @JoinColumn()
  player: User;

  @Column({ type: Number, default: 0 })
  score: number;

  @OneToMany(() => Answer, (a) => a.player, {
    cascade: true,
    nullable: true,
    onUpdate: 'CASCADE',
  })
  answers: Answer[];
}
