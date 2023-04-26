import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { AnswerStatusType } from '../../../../src/modules/public/quizGame/types/answerStatusType';

type AnswerType = {
  questionId: string;
  answerStatus: AnswerStatusType;
  addedAt: Date;
};

export const addAnswersByUserHelper = async (
  answers: string[],
  token: string,
  server: any,
) => {
  const answersArray: AnswerType[] = [];
  for (let i = 0; i < answers.length; i++) {
    const res = await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ answer: answers[i] })
      .expect(HttpStatus.OK);

    answersArray.push(res.body);
  }

  return answersArray;
};
