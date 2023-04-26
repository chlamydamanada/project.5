import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Question } from '../../../superAdmin/quizQuestions/domain/question.entity';

@Entity()
export class QuestionOfGame {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  gameId: string;

  @ManyToOne(() => Game, (q) => q.questions, { onDelete: 'CASCADE' })
  @JoinColumn()
  game: Game;

  @Column({ type: 'uuid' })
  questionId: string;

  @ManyToOne(() => Question, (q) => q.questionOfGame)
  @JoinColumn()
  question: Question;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  addedAt: Date;
}
