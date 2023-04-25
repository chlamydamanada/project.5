import request from 'supertest';
import { HttpStatus } from '@nestjs/common';
import { LoginConstants } from '../../testsConstants/loginConstants';

type AccessTokenType = {
  accessToken: string;
};

export const loginSeveralUsers = async (
  count: number,
  server: any,
): Promise<AccessTokenType[]> => {
  const tokens: AccessTokenType[] = [];
  for (let i = 1; i <= count; i++) {
    //login user
    const res = await request(server)
      .post('/auth/login')
      .set('User-Agent', 'Chrome')
      .send(LoginConstants[`valid_login_` + i])
      .expect(HttpStatus.OK);
    //add token to array
    tokens.push(res.body);
  }
  return tokens;
};
