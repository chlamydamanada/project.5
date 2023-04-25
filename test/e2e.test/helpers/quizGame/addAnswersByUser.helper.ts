import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

export const addAnswersByUserHelper = async (
  answers: string[],
  token: string,
  server: any,
) => {
  for (let i = 0; i < answers.length; i++) {
    await request(server)
      .post('/pair-game-quiz/pairs/my-current/answers')
      .set('Authorization', `Bearer ${token}`)
      .send({ answer: answers[i] })
      .expect(HttpStatus.OK);
  }

  return;
};
