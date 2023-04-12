import request from 'supertest';

type questionDtoType = {
  body: string;
  correctAnswers: string[];
};

export const createQuestion = async (
  questionDto: questionDtoType,
  server: any,
) => {
  return request(server)
    .post('/sa/quiz/questions')
    .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
    .send(questionDto)
    .expect(201);
};
