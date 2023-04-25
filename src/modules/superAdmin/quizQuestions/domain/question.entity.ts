import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuestionOfGame } from '../../../public/quizGame/domain/questionOfGame.entity';

@Entity()
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  body: string;

  @Column({ default: false })
  published: boolean;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true, default: null })
  updatedAt: Date | null;

  @Column({ type: 'character varying', array: true })
  correctAnswers: string[];

  @OneToMany(() => QuestionOfGame, (q) => q.question)
  questionOfGame: QuestionOfGame;
}
