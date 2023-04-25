import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { UsersConstants } from '../../testsConstants/usersConstants';

type UserType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};

export const createSeveralUsers = async (count: number, server: any) => {
  const createdUsers: UserType[] = [];
  for (let i = 1; i <= count; i++) {
    //create user
    const res = await request(server)
      .post('/sa/users')
      .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      .send(UsersConstants[`valid_user_` + i])
      .expect(HttpStatus.CREATED);
    //add to array of users
    createdUsers.push(res.body);
  }
  return createdUsers;
};
