import { INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { QuestionsConstants } from '../../testsConstants/questionsConstants';
import { createSeveralQuestions } from '../../helpers/questions/createSeveralQuestions.helper';
import { publishOrUnpublishQuestion } from '../../helpers/questions/publishQuestion.hf';

describe('Testing sa users controller', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let server: any;
  let dataSource;
  beforeAll(async () => {
    //connection:
    app = await getApp();
    server = app.getHttpServer();
    //connecting to db:
    dataSource = await app.resolve(DataSource);
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CREATE QUESTION', () => {
    it('shouldn`t create new question without authorization: STATUS 401', async () => {
      await request(server)
        .post('/sa/quiz/questions')
        .send(QuestionsConstants.create_question)
        .expect(401);
    });
    it('shouldn`t create new question with incorrect body(isn`t string): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_1)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t create new question with incorrect body(too short string): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_2)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t create new question with incorrect body(too long string): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_3)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t create new question with incorrect answers(null): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_1)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t create new question with incorrect answers(string): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_2)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t create new question with incorrect answers(boolean): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_3)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t create new question with incorrect answers(empty array): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_4)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t create new question with incorrect answers(boolean[]): STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_5)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t create new question with incorrect data: STATUS 400', async () => {
      const res = await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question)
        .expect(400);
      //should be 2 errors in body field and correctAnswers field
      expect(res.body.errorsMessages).toHaveLength(2);
    });
    it('should create new question with correct data: STATUS 201', async () => {
      await request(server)
        .post('/sa/quiz/questions')
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.create_question)
        .expect(201);
    });
    it('should take question from db and be the same question which try to create', async () => {
      const question = await dataSource.query(
        `
SELECT "id", "body", "published", "createdAt", "updatedAt", "correctAnswers"
FROM public.question
WHERE "body" = $1`,
        [QuestionsConstants.create_question.body],
      );
      expect(question[0]).toBeTruthy();
      expect(question).toHaveLength(1);
    });
  });

  describe('DELETE ALL DATA 1', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('DELETE QUESTION BY ID', () => {
    let question;
    beforeAll(async () => {
      question = await createSeveralQuestions(1, server);
    });
    it('shouldn`t delete question without authorization: STATUS 401', async () => {
      await request(server)
        .delete(`/sa/quiz/questions/${question.body.id}`)
        .expect(401);
    });
    it('should delete question by id: STATUS 204', async () => {
      await request(server)
        .delete(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(204);
    });
    it('shouldn`t find question in db by id', async () => {
      const questionDb = await dataSource.query(
        `
SELECT "id", "body", "published", "createdAt", "updatedAt", "correctAnswers"
FROM public.question
WHERE "id" = $1`,
        [question.body.id],
      );
      expect(questionDb).toHaveLength(0);
      expect(question[0]).not.toBeTruthy();
    });
    it('shouldn`t delete question which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .delete(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(404);
    });
  });

  describe('PUBLISH OR UNPUBLISH QUESTION', () => {
    let question;
    beforeAll(async () => {
      question = await createSeveralQuestions(1, server);
    });
    it('shouldn`t publish question without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}/publish`)
        .send(QuestionsConstants.publish)
        .expect(401);
    });
    it('shouldn`t publish question with incorrect data(string): STATUS 400', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}/publish`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_publish_1)
        .expect(400);
    });
    it('shouldn`t publish question with incorrect data(number): STATUS 400', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}/publish`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_publish_2)
        .expect(400);
    });
    it('shouldn`t publish question which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${QuestionsConstants.invalid_id}/publish`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.publish)
        .expect(404);
    });
    it('should publish question by correct data: STATUS 204', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}/publish`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.publish)
        .expect(204);
    });
    it('should get question from db and check is published true', async () => {
      const questionDb = await dataSource.query(
        `
SELECT "id", "body", "published", "createdAt", "updatedAt", "correctAnswers"
FROM public.question
WHERE "id" = $1`,
        [question.body.id],
      );
      expect(questionDb).toHaveLength(1);
      expect(questionDb[0].published).toBe(true);
    });
  });

  describe('DELETE ALL DATA 2', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('UPDATE QUESTION BY ID', () => {
    let question;
    beforeAll(async () => {
      question = await createSeveralQuestions(1, server);
    });
    it('shouldn`t update question without authorization: STATUS 401', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .send(QuestionsConstants.update_question)
        .expect(401);
    });
    it('shouldn`t update question with incorrect body(isn`t string): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_1)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t update question with incorrect body(too short string): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_2)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t update question with incorrect body(too long string): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_body_3)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('body');
    });
    it('shouldn`t update question with incorrect answers(null): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_1)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t update question with incorrect answers(string): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_2)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t update question with incorrect answers(boolean): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_3)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t update question with incorrect answers(empty array): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_4)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t update question with incorrect answers(boolean[]): STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question_answers_5)
        .expect(400);

      expect(res.body.errorsMessages[0].field).toBe('correctAnswers');
    });
    it('shouldn`t update question with incorrect data: STATUS 400', async () => {
      const res = await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.invalid_question)
        .expect(400);
      //should be 2 errors in body field and correctAnswers field
      expect(res.body.errorsMessages).toHaveLength(2);
    });

    it('shouldn`t update question which doesn`t exist: STATUS 404', async () => {
      await request(server)
        .put(`/sa/quiz/questions/${QuestionsConstants.invalid_id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.update_question)
        .expect(404);
    });
    it('shouldn`t update question which is published: STATUS 400', async () => {
      await publishOrUnpublishQuestion(
        server,
        question.body.id,
        QuestionsConstants.publish,
      );
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.update_question)
        .expect(400);
    });
    it('should update question with correct data: STATUS 204', async () => {
      await publishOrUnpublishQuestion(
        server,
        question.body.id,
        QuestionsConstants.unpublish,
      );
      await request(server)
        .put(`/sa/quiz/questions/${question.body.id}`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .send(QuestionsConstants.update_question)
        .expect(204);
    });
    it('should get question from db and check is question updated', async () => {
      const questionDb = await dataSource.query(
        `
SELECT "id", "body", "published", "createdAt", "updatedAt", "correctAnswers"
FROM public.question
WHERE "id" = $1`,
        [question.body.id],
      );
      expect(questionDb).toHaveLength(1);
      expect(questionDb[0].body).toBe(QuestionsConstants.update_question.body);
      expect(questionDb[0].body).not.toBe(
        QuestionsConstants.create_question.body,
      );
      expect(questionDb[0].correctAnswers).toHaveLength(2);
    });
  });

  describe('DELETE ALL DATA 3', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET ALL QUESTIONS by sa', () => {
    let questions: any = [];

    beforeAll(async () => {
      //create 7 question
      questions = await createSeveralQuestions(7, server);
      // publish 2 of all questions
      for (let i = 0; i < 2; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }
    });
    it('shouldn`t get all questions without authorization: STATUS 401', async () => {
      await request(server).get(`/sa/quiz/questions`).expect(401);
    });
    it('should get all questions with default filters ang pagination: STATUS 200', async () => {
      const res = await request(server)
        .get(`/sa/quiz/questions`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 7,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(7);
    });
    it('should get 2 questions with publish status true: STATUS 200', async () => {
      const res = await request(server)
        .get(`/sa/quiz/questions?publishedStatus=published`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(2);
    });
    it('should get one question which body has 2: STATUS 200', async () => {
      const res = await request(server)
        .get(`/sa/quiz/questions?bodySearchTerm=2`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].body).toBe('What`s 12 + 2 = ?');
    });
    it('should get two questions which bodies have 1 and publish status true: STATUS 200', async () => {
      const res = await request(server)
        .get(`/sa/quiz/questions?bodySearchTerm=1&publishedStatus=published`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(2);
    });
    it('should get five questions which publish status false: STATUS 200', async () => {
      const res = await request(server)
        .get(`/sa/quiz/questions?publishedStatus=notPublished`)
        .set('Authorization', `Basic YWRtaW46cXdlcnR5`)
        .expect(200);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 5,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(5);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
