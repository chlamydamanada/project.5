import request from 'supertest';
import { QuestionsConstants } from '../../testsConstants/questionsConstants';

type QuestionType = {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const createSeveralQuestions = async (
  count: number,
  server: any,
): Promise<QuestionType[]> => {
  // max count of questions = 10
  const createsQuestions: QuestionType[] = [];

  for (let i = 1; i <= count; i++) {
    //create question
    const res = await request(server)
      .post('/sa/quiz/questions')
      .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
      .send(QuestionsConstants[`valid_question_` + i])
      .expect(201);

    //add to array of questions
    createsQuestions.push(res.body);
  }
  return createsQuestions;
};
