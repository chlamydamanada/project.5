import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { GameStatusModel } from '../types/gameStatusType';
import { QuestionOfGame } from './questionOfGame.entity';
import { PlayerProgress } from './player.entity';

@Entity()
export class Game {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({
    type: 'enum',
    enum: GameStatusModel,
    default: GameStatusModel.pending,
  })
  status: GameStatusModel;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  //Date when first player join to game
  pairCreatedDate: Date;

  @Column({ type: 'timestamptz', default: null })
  //Game starts when second player join to game
  startGameDate: Date | null;

  @Column({ type: 'timestamptz', default: null })
  //Game finishes when both players have answered all the questions
  finishGameDate: Date | null;

  @OneToMany(() => QuestionOfGame, (q) => q.game, {
    nullable: true,
  })
  //create questions when second player join to game
  questions: QuestionOfGame[] | null;

  @OneToOne(() => PlayerProgress, (p) => p.game, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  firstPlayerProgress: PlayerProgress;

  @Column({ type: 'uuid' })
  firstPlayerProgressId: string; //playerId

  @OneToOne(() => PlayerProgress, (p) => p.game, {
    nullable: true,
    cascade: true,
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  secondPlayerProgress: PlayerProgress | null;

  @Column({ type: 'uuid', nullable: true, default: null })
  secondPlayerProgressId: string; //playerId
}
