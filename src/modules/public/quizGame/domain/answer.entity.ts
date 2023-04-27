import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PlayerProgress } from './player.entity';
import { AnswerStatusType } from '../types/answerStatusType';

@Entity()
export class Answer {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column()
  body: string;

  @ManyToOne(() => PlayerProgress, (p) => p.answers)
  @JoinColumn()
  player: PlayerProgress;

  @Column({ type: 'uuid' })
  playerId: string; //  PlayerProgressId

  @Column({ type: 'uuid' })
  questionId: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;

  @Column({
    type: 'enum',
    enum: AnswerStatusType,
  })
  answerStatus: AnswerStatusType;
}
