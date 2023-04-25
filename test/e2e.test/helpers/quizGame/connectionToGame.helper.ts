import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

export const connectUserToGameHelper = async (token: string, server: any) => {
  return request(server)
    .post('/pair-game-quiz/pairs/connection')
    .set('Authorization', `Bearer ${token}`)
    .expect(HttpStatus.OK);
};
