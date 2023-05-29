import { HttpStatus, INestApplication } from '@nestjs/common';
import { getApp } from '../../testsConnection';
import request from 'supertest';
import { createSeveralUsers } from '../../helpers/users/createSeveralUsers.helper';
import { loginSeveralUsers } from '../../helpers/auth/loginSeveralUsers.helper';
import { createSeveralQuestions } from '../../helpers/questions/createSeveralQuestions.helper';
import { publishOrUnpublishQuestion } from '../../helpers/questions/publishQuestion.hf';
import { QuestionsConstants } from '../../testsConstants/questionsConstants';
import { GameStatusModel } from '../../../../src/modules/public/quizGame/types/gameStatusType';
import { UsersConstants } from '../../testsConstants/usersConstants';
import { DataSource } from 'typeorm';
import { connectUserToGameHelper } from '../../helpers/quizGame/connectionToGame.helper';
import { addAnswersByUserHelper } from '../../helpers/quizGame/addAnswersByUser.helper';
import { AnswerStatusType } from '../../../../src/modules/public/quizGame/types/answerStatusType';
import { delay } from '../../../delayFunction';

describe('Testing QUIZ GAME', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let server: any;
  let dataSource;
  beforeAll(async () => {
    app = await getApp();
    server = app.getHttpServer();
    //connecting to db:
    dataSource = await app.resolve(DataSource);
  });

  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('CONNECTION TO GAME', () => {
    let tokens;
    let startGame;

    beforeAll(async () => {
      //create 5 questions by sa
      const questions = await createSeveralQuestions(5, server);
      //publish 5 questions by sa
      for (let i = 0; i < 5; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }
      //create 3 users by sa
      await createSeveralUsers(3, server);
      //login 3 users
      tokens = await loginSeveralUsers(3, server);
    });
    it('shouldn`t connection to the game without authorization: STATUS 401', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should connect first user to the game(gameStatus should be PendingSecondPlayer): STATUS 200', async () => {
      const res = await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.pending,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
        questions: null,
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });

      //should be empty array of answers of first user
      expect(res.body.firstPlayerProgress.answers).toHaveLength(0);
    });
    it('shouldn`t connect first user to the game twice(connecting to pending game): STATUS 403', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should connect second user to the game(gameStatus should be Active): STATUS 200', async () => {
      startGame = await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(startGame.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
      expect(startGame.body.questions).toHaveLength(5);
      //should be empty array of answers of first and second users
      expect(startGame.body.firstPlayerProgress.answers).toHaveLength(0);
      expect(startGame.body.secondPlayerProgress.answers).toHaveLength(0);
    });
    it('shouldn`t connection to game if current user hasn`t finished the first game yet(create new game): STATUS 403', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE ALL DATA 1', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('ADD ANSWER BY USERS', () => {
    let tokens;
    let firstGame;
    let firstActiveGameQuestions;
    let secondGame;

    beforeAll(async () => {
      //create 5 questions by sa
      const questionsOfGame = await createSeveralQuestions(5, server);
      //publish 5 questions by sa
      for (let i = 0; i < 5; i++) {
        await publishOrUnpublishQuestion(
          server,
          questionsOfGame[i].id,
          QuestionsConstants.publish,
        );
      }

      //create 3 users by sa
      await createSeveralUsers(3, server);

      //login 3 users
      tokens = await loginSeveralUsers(3, server);

      //connect two users to game
      firstGame = await connectUserToGameHelper(tokens[0].accessToken, server);
      await connectUserToGameHelper(tokens[1].accessToken, server);
    });

    it('shouldn`t add answer without authorization: STATUS 401', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .send({ answer: 'string' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('shouldn`t add answer with incorrect data(number): STATUS 400', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: 5 })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('shouldn`t add answer with incorrect data(boolean): STATUS 400', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: false })
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('shouldn`t add answer if user haven`t active game: STATUS 403', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[2].accessToken}`)
        .send({ answer: 'string' })
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should add first answers by first and second user: STATUS 200', async () => {
      //get questions and correct answers by game id from db for first and second user
      firstActiveGameQuestions = await dataSource.query(
        `
  SELECT q."id", q."body", q."correctAnswers" FROM public."game" g
  LEFT JOIN "question_of_game" qg ON qg."gameId" = g."id"
  LEFT JOIN "question" q ON qg."questionId" = q."id"
  WHERE g."id" = $1
  ORDER BY qg."addedAt" ASC`,
        [firstGame.body.id],
      );

      // add correct answer by first user the first question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: firstActiveGameQuestions[0].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: firstActiveGameQuestions[0].id,
        answerStatus: 'Correct',
        addedAt: expect.any(String),
      });

      //add incorrect answer by second user the first question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: 'true' })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: firstActiveGameQuestions[0].id,
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });
    });
    it('should add second answers by first and second user: STATUS 200', async () => {
      // add incorrect answer by first user the second question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: 'null' })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: firstActiveGameQuestions[1].id,
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });

      //add correct answer by second user the second question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: firstActiveGameQuestions[1].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: firstActiveGameQuestions[1].id,
        answerStatus: 'Correct',
        addedAt: expect.any(String),
      });
    });
    it('should add third answers by first and second user: STATUS 200', async () => {
      // add incorrect answer by first user the third question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: 'null' })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: firstActiveGameQuestions[2].id,
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });

      //add correct answer by second user the third question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: firstActiveGameQuestions[2].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: firstActiveGameQuestions[2].id,
        answerStatus: 'Correct',
        addedAt: expect.any(String),
      });
    });
    it('should add fourth answers by first and second user: STATUS 200', async () => {
      // add correct answer by first user the fourth question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: firstActiveGameQuestions[3].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: firstActiveGameQuestions[3].id,
        answerStatus: 'Correct',
        addedAt: expect.any(String),
      });

      //add correct answer by second user the fourth question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: firstActiveGameQuestions[3].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: firstActiveGameQuestions[3].id,
        answerStatus: 'Correct',
        addedAt: expect.any(String),
      });
    });
    it('should add fifth answer by first user: STATUS 200', async () => {
      // add incorrect answer by first user the fifth question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: 'string' })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: firstActiveGameQuestions[4].id,
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });
    });
    it('shouldn`t add sixth answer by first user(game not finished: second user doesn`t answer to question): STATUS 403', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: 'string' })
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should add fifth answer by second user: STATUS 200', async () => {
      //add incorrect answer by second user the third question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: 'string' })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: firstActiveGameQuestions[4].id,
        answerStatus: 'Incorrect',
        addedAt: expect.any(String),
      });
    });

    it('should find game: status - finished, scores: 3 - 3(1 bonus for first user), finishedDate', async () => {
      const firstPlayerGame = await dataSource.query(
        `
  SELECT  g."id", g."status", g."pairCreatedDate", g."startGameDate", g."finishGameDate",
  pp."id" as "firstPlayerId", pp."score", a."answerStatus"
  FROM public."game" g
  LEFT JOIN "player_progress" pp ON pp."id" = g."firstPlayerProgressId"
  LEFT JOIN "answer" a ON a."playerId" = pp."id"
  WHERE g."id" = $1`,
        [firstGame.body.id],
      );

      expect(firstPlayerGame[0].status).toBe('Finished');
      expect(firstPlayerGame[0].finishGameDate).toBeTruthy();
      expect(firstPlayerGame[0].score).toBe(3);
      expect(firstPlayerGame).toHaveLength(5);

      const secondPlayerGame = await dataSource.query(
        `
  SELECT  g."id", g."status", g."pairCreatedDate", g."startGameDate", g."finishGameDate",
  pp."id" as "secondPlayerId", pp."score", a."answerStatus"
  FROM public."game" g
  LEFT JOIN "player_progress" pp ON pp."id" = g."secondPlayerProgressId"
  LEFT JOIN "answer" a ON a."playerId" = pp."id"
  WHERE g."id" = $1`,
        [firstGame.body.id],
      );
      expect(secondPlayerGame[0].status).toBe('Finished');
      expect(secondPlayerGame[0].finishGameDate).toBeTruthy();
      expect(secondPlayerGame[0].score).toBe(3);
      expect(secondPlayerGame).toHaveLength(5);
    });

    it('should connect the second game and add answers to questions: STATUS 200', async () => {
      //connect two users to game
      secondGame = await connectUserToGameHelper(tokens[0].accessToken, server);
      await connectUserToGameHelper(tokens[1].accessToken, server);

      //get questions and correct answers by game id from db for first and second user
      const secondActiveGameQuestions = await dataSource.query(
        `
  SELECT q."body", q."correctAnswers" FROM public."game" g
  LEFT JOIN "question_of_game" qg ON qg."gameId" = g."id"
  LEFT JOIN "question" q ON qg."questionId" = q."id"
  WHERE g."id" = $1
  ORDER BY qg."addedAt" ASC`,
        [secondGame.body.id],
      );

      //first user answer to 4 questions(all answers are incorrect): no bonus!
      await addAnswersByUserHelper(
        ['null', 'null', 'no', 'lol'],
        tokens[0].accessToken,
        server,
      );

      //second user answer to 4 questions(only first answer is correct): no bonus
      await addAnswersByUserHelper(
        [secondActiveGameQuestions[0].correctAnswers[0], 'null', 'no', 'lol'],
        tokens[1].accessToken,
        server,
      );

      //first user answer to last question(all answers are incorrect): no bonus!
      await addAnswersByUserHelper(['nothing'], tokens[0].accessToken, server);

      //second user answer to last question(only first answer is correct): no bonus
      await addAnswersByUserHelper(['nothing'], tokens[1].accessToken, server);
    });
    it('should get game with firstUser.score = 0(no bonus), secondUser.score = 1', async () => {
      const firstPlayerGame = await dataSource.query(
        `
  SELECT  g."id", g."status", g."pairCreatedDate", g."startGameDate", g."finishGameDate",
  pp."id" as "firstPlayerId", pp."score", a."answerStatus"
  FROM public."game" g
  LEFT JOIN "player_progress" pp ON pp."id" = g."firstPlayerProgressId"
  LEFT JOIN "answer" a ON a."playerId" = pp."id"
  WHERE g."id" = $1`,
        [secondGame.body.id],
      );

      expect(firstPlayerGame[0].status).toBe('Finished');
      expect(firstPlayerGame[0].finishGameDate).toBeTruthy();
      expect(firstPlayerGame[0].score).toBe(0);
      expect(firstPlayerGame).toHaveLength(5);

      const secondPlayerGame = await dataSource.query(
        `
  SELECT  g."id", g."status", g."pairCreatedDate", g."startGameDate", g."finishGameDate",
  pp."id" as "secondPlayerId", pp."score", a."answerStatus"
  FROM public."game" g
  LEFT JOIN "player_progress" pp ON pp."id" = g."secondPlayerProgressId"
  LEFT JOIN "answer" a ON a."playerId" = pp."id"
  WHERE g."id" = $1`,
        [secondGame.body.id],
      );
      expect(secondPlayerGame[0].status).toBe('Finished');
      expect(secondPlayerGame[0].finishGameDate).toBeTruthy();
      expect(secondPlayerGame[0].score).toBe(1);
      expect(secondPlayerGame).toHaveLength(5);
    });
  });

  describe('DELETE ALL DATA 2', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET GAME BY ID', () => {
    let tokens;
    let game;
    beforeAll(async () => {
      //create 5 questions by sa
      const questions = await createSeveralQuestions(5, server);
      //publish 5 questions by sa
      for (let i = 0; i < 5; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }

      //create 3 users by sa
      await createSeveralUsers(3, server);

      //login 3 users
      tokens = await loginSeveralUsers(3, server);

      //connect two users to game
      game = await connectUserToGameHelper(tokens[0].accessToken, server);
    });
    it('shouldn`t find game without authorization: STATUS 401', async () => {
      await request(server)
        .get(`/pair-game-quiz/pairs/${game.body.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('shouldn`t find game by invalid gameId(not uuid): STATUS 400', async () => {
      await request(server)
        .get(`/pair-game-quiz/pairs/${123456789}`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.BAD_REQUEST);
    });
    it('shouldn`t find game by incorrect gameId: STATUS 404', async () => {
      await request(server)
        .get(`/pair-game-quiz/pairs/111a11b1-11c1-1111-1111-d1e1ab11c111`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('shouldn`t find game by other user: STATUS 403', async () => {
      await request(server)
        .get(`/pair-game-quiz/pairs/${game.body.id}`)
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
    it('should find game by id by first user(status: PendingSecondPlayer): STATUS 200', async () => {
      const res = await request(server)
        .get(`/pair-game-quiz/pairs/${game.body.id}`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.pending,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
        questions: null,
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });

      //should be empty array of answers of first user
      expect(res.body.firstPlayerProgress.answers).toHaveLength(0);
    });
    it('should find game by id by second user(status: Active): STATUS 200', async () => {
      //add second user to game
      await connectUserToGameHelper(tokens[1].accessToken, server);

      // find game by id
      const res = await request(server)
        .get(`/pair-game-quiz/pairs/${game.body.id}`)
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });

      //should be empty array of answers of first and second users
      expect(res.body.firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.secondPlayerProgress.answers).toHaveLength(0);
    });
    it('should find game by id (status: Finished): STATUS 200', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        ['ten', 'twelve', 'six', 'two'],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        ['two', 'nothing', 'ten', 'six'],
        tokens[1].accessToken,
        server,
      );

      //add last answer of first user
      await addAnswersByUserHelper(['nothing'], tokens[0].accessToken, server);

      //add last answer of second user
      await addAnswersByUserHelper(['nothing'], tokens[1].accessToken, server);

      // find game by id
      const res = await request(server)
        .get(`/pair-game-quiz/pairs/${game.body.id}`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: expect.any(Number),
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: expect.any(Number),
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });

      //array of questions should contain 5 questions
      expect(res.body.questions).toHaveLength(5);

      //array of answers should contain 5 answers of both users
      expect(res.body.firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.secondPlayerProgress.answers).toHaveLength(5);
    });
  });

  describe('DELETE ALL DATA 3', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET MY-CURRENT GAME', () => {
    let tokens;
    let game;
    let questionsOfGame;
    beforeAll(async () => {
      //create 5 questions by sa
      const questions = await createSeveralQuestions(5, server);
      //publish 5 questions by sa
      for (let i = 0; i < 5; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }

      //create 3 users by sa
      await createSeveralUsers(3, server);

      //login 3 users
      tokens = await loginSeveralUsers(3, server);
    });
    it('shouldn`t find game without authorization: STATUS 401', async () => {
      await request(server)
        .get(`/pair-game-quiz/pairs/my-current`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('shouldn`t find game if no active pair for current user: STATUS 404', async () => {
      await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
    it('should find game with status pendingSecondPlayer for current user: STATUS 200', async () => {
      //connect first user to game
      game = await connectUserToGameHelper(tokens[0].accessToken, server);

      // find game for current user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.pending,
        pairCreatedDate: expect.any(String),
        startGameDate: null,
        finishGameDate: null,
        questions: null,
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });

      //array of answers should contain 0 answers of first user
      expect(res.body.firstPlayerProgress.answers).toHaveLength(0);
    });
    it('should find game with status Active for current user: STATUS 200', async () => {
      //add second user to game
      await connectUserToGameHelper(tokens[1].accessToken, server);

      // find game for current user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: expect.any(String),
        status: GameStatusModel.active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });

      //array of questions should contain 5 questions
      expect(res.body.questions).toHaveLength(5);

      //array of answers should contain  answers of both users
      expect(res.body.firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.secondPlayerProgress.answers).toHaveLength(0);
    });
    it('should add first answer by first user and get current game with answer: STATUS 200', async () => {
      //get questions and correct answers by game id from db
      questionsOfGame = await dataSource.query(
        `
SELECT q."body", q."correctAnswers" FROM public."game" g 
LEFT JOIN "question_of_game" qg ON qg."gameId" = g."id"
LEFT JOIN "question" q ON qg."questionId" = q."id"
WHERE g."id" = $1
ORDER BY qg."addedAt" ASC`,
        [game.body.id],
      );

      // add first incorrect answer by first user
      const firstAnswer = await addAnswersByUserHelper(
        ['nothing'],
        tokens[0].accessToken,
        server,
      );

      // find game for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      //should add one answer to array
      expect(res.body.firstPlayerProgress.answers).toHaveLength(1);

      expect(firstAnswer[0]).toEqual({
        questionId: res.body.questions[0].id,
        answerStatus: AnswerStatusType.Incorrect,
        addedAt: expect.any(String),
      });

      expect(firstAnswer[0]).toEqual({
        questionId: res.body.firstPlayerProgress.answers[0].questionId,
        answerStatus: res.body.firstPlayerProgress.answers[0].answerStatus,
        addedAt: res.body.firstPlayerProgress.answers[0].addedAt,
      });
    });
    it('should add second answer by first user and get current game with answers: STATUS 200', async () => {
      // add second correct answer by first user
      const secondAnswer = await addAnswersByUserHelper(
        [questionsOfGame[1].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );

      // find game for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      //should be 2 answers of first user
      expect(res.body.firstPlayerProgress.answers).toHaveLength(2);

      expect(secondAnswer[0]).toEqual({
        questionId: res.body.questions[1].id,
        answerStatus: AnswerStatusType.Correct,
        addedAt: expect.any(String),
      });

      expect(secondAnswer[0]).toEqual({
        questionId: res.body.firstPlayerProgress.answers[1].questionId,
        answerStatus: res.body.firstPlayerProgress.answers[1].answerStatus,
        addedAt: res.body.firstPlayerProgress.answers[1].addedAt,
      });
    });

    it('should add first answer by second user and get current game with answer: STATUS 200', async () => {
      // add first incorrect answer by second user
      const firstAnswer = await addAnswersByUserHelper(
        ['nothing'],
        tokens[1].accessToken,
        server,
      );

      // find game for second user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      //should be 1 answer of second user
      expect(res.body.firstPlayerProgress.answers).toHaveLength(2);

      expect(firstAnswer[0]).toEqual({
        questionId: res.body.questions[0].id,
        answerStatus: AnswerStatusType.Incorrect,
        addedAt: expect.any(String),
      });

      expect(firstAnswer[0]).toEqual({
        questionId: res.body.secondPlayerProgress.answers[0].questionId,
        answerStatus: res.body.secondPlayerProgress.answers[0].answerStatus,
        addedAt: res.body.secondPlayerProgress.answers[0].addedAt,
      });
    });

    it('shouldn`t get game with status Finished for current user: STATUS 404 ', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        ['six', 'two', 'nothing'],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        ['nothing', 'ten', 'six', 'twelve'],
        tokens[1].accessToken,
        server,
      );

      // find game for current user
      await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE ALL DATA 4', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('GET ALL GAMES | STATISTIC OF CURRENT USER | TOP PLAYERS', () => {
    let tokens;
    let firstGame;
    let firstGameAnswers;
    let secondGame;
    let secondGameAnswers;
    let thirdGame;
    let thirdGameAnswers;
    let fourthGame;
    let fourthGameAnswers;
    beforeAll(async () => {
      //create 10 questions by sa
      const questions = await createSeveralQuestions(10, server);
      //publish 10 questions by sa
      for (let i = 0; i < 10; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }

      //create 4 users by sa
      await createSeveralUsers(6, server);

      //login 4 users
      tokens = await loginSeveralUsers(6, server);
    });
    it('shouldn`t find all games of current user without authorization: STATUS 401', async () => {
      await request(server)
        .get('/pair-game-quiz/pairs/my')
        .expect(HttpStatus.UNAUTHORIZED);
    });
    it('should find empty array of games of current user: STATUS 200', async () => {
      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 0,
        page: 1,
        pageSize: 10,
        totalCount: 0,
        items: expect.any(Array),
      });
      expect(res.body.items).toHaveLength(0);
    });
    it('should find array with one active game of current user: STATUS 200', async () => {
      //connect first user and second user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      firstGame = await connectUserToGameHelper(tokens[1].accessToken, server);
      firstGameAnswers = await dataSource.query(
        `
      select g."id" as "gameId", array(
        select row_to_json(row) from(
            select qq."questionId" as "id", qq."body", qq."correctAnswers" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
      as questions
      from "game" g
      where g."id" = $1`,
        [firstGame.body.id],
      );

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(firstGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Active');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(0);
    });
    it('should find array with one finished game of current user: STATUS 200', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        [
          firstGameAnswers[0].questions[0].correctAnswers[0],
          firstGameAnswers[0].questions[1].correctAnswers[0],
          firstGameAnswers[0].questions[2].correctAnswers[0],
          'null',
        ],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        [
          firstGameAnswers[0].questions[0].correctAnswers[0],
          firstGameAnswers[0].questions[1].correctAnswers[0],
          firstGameAnswers[0].questions[2].correctAnswers[0],
          firstGameAnswers[0].questions[3].correctAnswers[0],
        ],
        tokens[1].accessToken,
        server,
      );

      //add last answer of first user
      await addAnswersByUserHelper(['null'], tokens[0].accessToken, server);

      //add last answer of second user
      await addAnswersByUserHelper(
        [firstGameAnswers[0].questions[4].correctAnswers[0]],
        tokens[1].accessToken,
        server,
      );

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 1,
        items: expect.any(Array),
      });
      //first game should be:
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(firstGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Finished');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].firstPlayerProgress.score).toBe(4);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].secondPlayerProgress.score).toBe(5);
    });
    it('should get statistic with one game to first user: STATUS 200', async () => {
      //statistic for first user
      const firstUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(firstUserStatistic.body).toEqual({
        sumScore: 4,
        avgScores: 4,
        gamesCount: 1,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
    it('should get statistic with one game to second user: STATUS 200', async () => {
      //statistic for second user
      const secondUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(secondUserStatistic.body).toEqual({
        sumScore: 5,
        avgScores: 5,
        gamesCount: 1,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 0,
      });
    });
    it('should find array with two games(finished and active) of current user: STATUS 200', async () => {
      //connect first user and third user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      secondGame = await connectUserToGameHelper(tokens[2].accessToken, server);
      secondGameAnswers = await dataSource.query(
        `
      select g."id" as "gameId", array(
        select row_to_json(row) from(
            select qq."questionId" as "id", qq."body", qq."correctAnswers" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
      as questions
      from "game" g
      where g."id" = $1`,
        [secondGame.body.id],
      );

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array),
      });

      //should be two different games in array
      expect(res.body.items[0].id).not.toBe(res.body.items[1].id);

      //should be 2 games: active and finished
      expect(res.body.items).toHaveLength(2);

      //first in array should be new game: status active, have 5 questions, 0 answers
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].id).toBe(secondGame.body.id);
      expect(res.body.items[0].status).toBe('Active');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(0);

      //second in array should be first game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[1].id).toBe(firstGame.body.id);
      expect(res.body.items[1].questions).toHaveLength(5);
      expect(res.body.items[1].status).toBe('Finished');
      expect(res.body.items[1].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].secondPlayerProgress.answers).toHaveLength(5);
    });
    it('should find array with two finished game of current user: STATUS 200', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        [
          secondGameAnswers[0].questions[0].correctAnswers[0],
          secondGameAnswers[0].questions[1].correctAnswers[0],
          secondGameAnswers[0].questions[2].correctAnswers[0],
          secondGameAnswers[0].questions[3].correctAnswers[0],
        ],
        tokens[0].accessToken,
        server,
      );
      //add answers of third user
      await addAnswersByUserHelper(
        [
          secondGameAnswers[0].questions[0].correctAnswers[0],
          secondGameAnswers[0].questions[1].correctAnswers[0],
          'null',
          'null',
        ],
        tokens[2].accessToken,
        server,
      );
      //add last answer of first user
      await addAnswersByUserHelper(
        [secondGameAnswers[0].questions[4].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
      //add last answer of third user
      await addAnswersByUserHelper(['7777777'], tokens[2].accessToken, server);

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 2,
        items: expect.any(Array),
      });

      //should be two different games in array
      expect(res.body.items[0].id).not.toBe(res.body.items[1].id);

      //should be 2 games: two are finished
      expect(res.body.items).toHaveLength(2);

      //first in array should be new game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[0].id).toBe(secondGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Finished');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].firstPlayerProgress.score).toBe(6);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].secondPlayerProgress.score).toBe(2);

      //second in array should be first game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[1].id).toBe(firstGame.body.id);
      expect(res.body.items[1].questions).toHaveLength(5);
      expect(res.body.items[1].status).toBe('Finished');
      expect(res.body.items[1].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].secondPlayerProgress.answers).toHaveLength(5);
    });
    it('should get statistic with two games to first user: STATUS 200', async () => {
      //statistic for first user
      const firstUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(firstUserStatistic.body).toEqual({
        sumScore: 10,
        avgScores: 5,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
    it('should get statistic with two games to third user: STATUS 200', async () => {
      //statistic for third user
      const thirdUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[2].accessToken}`)
        .expect(HttpStatus.OK);

      expect(thirdUserStatistic.body).toEqual({
        sumScore: 2,
        avgScores: 2,
        gamesCount: 1,
        winsCount: 0,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
    it('should find array with one active and two finished games of current user: STATUS 200', async () => {
      //connect first user and second user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      thirdGame = await connectUserToGameHelper(tokens[1].accessToken, server);
      thirdGameAnswers = await dataSource.query(
        `
      select g."id" as "gameId", array(
        select row_to_json(row) from(
            select qq."questionId" as "id", qq."body", qq."correctAnswers" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
      as questions
      from "game" g
      where g."id" = $1`,
        [thirdGame.body.id],
      );

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });

      //should be 3 games of current user: first in array - active, two - finished
      expect(res.body.items).toHaveLength(3);

      //first game - third game of current user
      expect(res.body.items[0].id).toBe(thirdGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Active');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(0);

      //second game - second game of current user with status Finished
      expect(res.body.items[1].id).toBe(secondGame.body.id);
      expect(res.body.items[1].questions).toHaveLength(5);
      expect(res.body.items[1].status).toBe('Finished');
      expect(res.body.items[1].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].secondPlayerProgress.answers).toHaveLength(5);

      //third game - first game of current user with status Finished
      expect(res.body.items[2].id).toBe(firstGame.body.id);
      expect(res.body.items[2].questions).toHaveLength(5);
      expect(res.body.items[2].status).toBe('Finished');
      expect(res.body.items[2].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[2].secondPlayerProgress.answers).toHaveLength(5);
    });

    it('should get array of one game with sortBy: status, pageSize 1, pageNumber 1, default sortDirection: STATUS 200', async () => {
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my?sortBy=status&pageSize=1&pageNumber=1')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 3,
        page: 1,
        pageSize: 1,
        totalCount: 3,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(secondGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Finished');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
    });
    it('should get array of one game with sortBy-status, pageSize-1, pageNumber-1, sortDirection-asc: STATUS 200', async () => {
      const res = await request(server)
        .get(
          '/pair-game-quiz/pairs/my?sortBy=status&pageSize=1&pageNumber=1&sortDirection=asc',
        )
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 3,
        page: 1,
        pageSize: 1,
        totalCount: 3,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(thirdGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Active');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(0);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(0);
    });
    it('should find array with three finished game of current user: STATUS 200', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        [
          thirdGameAnswers[0].questions[0].correctAnswers[0],
          thirdGameAnswers[0].questions[1].correctAnswers[0],
          'null',
          'null',
        ],
        tokens[0].accessToken,
        server,
      );
      //add answers of second user
      await addAnswersByUserHelper(
        [
          thirdGameAnswers[0].questions[0].correctAnswers[0],
          thirdGameAnswers[0].questions[1].correctAnswers[0],
          thirdGameAnswers[0].questions[2].correctAnswers[0],
          'null',
        ],
        tokens[1].accessToken,
        server,
      );
      //add last answer of first user
      await addAnswersByUserHelper(['null'], tokens[0].accessToken, server);
      //add answers of second user
      await addAnswersByUserHelper(['7777777'], tokens[1].accessToken, server);

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });

      //should be 3 games: three are finished
      expect(res.body.items).toHaveLength(3);

      //first in array should be third game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[0].id).toBe(thirdGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Finished');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].firstPlayerProgress.score).toBe(3);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].secondPlayerProgress.score).toBe(3);

      //second in array should be second game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[1].id).toBe(secondGame.body.id);
      expect(res.body.items[1].questions).toHaveLength(5);
      expect(res.body.items[1].status).toBe('Finished');
      expect(res.body.items[1].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].firstPlayerProgress.score).toBe(6);
      expect(res.body.items[1].secondPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].secondPlayerProgress.score).toBe(2);

      //second in array should be first game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[2].id).toBe(firstGame.body.id);
      expect(res.body.items[2].questions).toHaveLength(5);
      expect(res.body.items[2].status).toBe('Finished');
      expect(res.body.items[2].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[2].firstPlayerProgress.score).toBe(4);
      expect(res.body.items[2].secondPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[2].secondPlayerProgress.score).toBe(5);
    });
    it('should get statistic with three games to first user: STATUS 200', async () => {
      //statistic for first user
      const firstUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(firstUserStatistic.body).toEqual({
        sumScore: 13,
        avgScores: 4.33,
        gamesCount: 3,
        winsCount: 1,
        lossesCount: 1,
        drawsCount: 1,
      });
    });
    it('should get statistic with three games to second user: STATUS 200', async () => {
      //statistic for second user
      const secondUserStatistic = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(secondUserStatistic.body).toEqual({
        sumScore: 8,
        avgScores: 4,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 1,
      });
    });
    it('should connect and finished fourth game', async () => {
      //connect third user and first user to game
      await connectUserToGameHelper(tokens[2].accessToken, server);
      fourthGame = await connectUserToGameHelper(tokens[0].accessToken, server);
      fourthGameAnswers = await dataSource.query(
        `
      select g."id" as "gameId", array(
        select row_to_json(row) from(
            select qq."questionId" as "id", qq."body", qq."correctAnswers" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
      as questions
      from "game" g
      where g."id" = $1`,
        [fourthGame.body.id],
      );
      //add answers of third user
      await addAnswersByUserHelper(
        [
          fourthGameAnswers[0].questions[0].correctAnswers[0],
          fourthGameAnswers[0].questions[1].correctAnswers[0],
          fourthGameAnswers[0].questions[2].correctAnswers[0],
          fourthGameAnswers[0].questions[3].correctAnswers[0],
        ],
        tokens[2].accessToken,
        server,
      );
      //add answers of first user
      await addAnswersByUserHelper(
        [
          fourthGameAnswers[0].questions[0].correctAnswers[0],
          fourthGameAnswers[0].questions[1].correctAnswers[0],
          fourthGameAnswers[0].questions[2].correctAnswers[0],
          fourthGameAnswers[0].questions[3].correctAnswers[0],
        ],
        tokens[0].accessToken,
        server,
      );
      //add last answer of third user
      await addAnswersByUserHelper(['null'], tokens[2].accessToken, server);
      //add last answer of first user
      await addAnswersByUserHelper(['null'], tokens[0].accessToken, server);

      //find all games for first user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 4,
        items: expect.any(Array),
      });
      //first game should be:
      expect(res.body.items).toHaveLength(4);
      expect(res.body.items[0].id).toBe(fourthGame.body.id);
    });
    it('should get statistic with four games to first user: STATUS 200', async () => {
      //statistic for first user
      const res = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        sumScore: 17,
        avgScores: 4.25,
        gamesCount: 4,
        winsCount: 1,
        lossesCount: 2,
        drawsCount: 1,
      });
    });
    it('should get statistic with four games to third user: STATUS 200', async () => {
      //statistic for third user
      const res = await request(server)
        .get('/pair-game-quiz/users/my-statistic')
        .set('Authorization', `Bearer ${tokens[2].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        sumScore: 7,
        avgScores: 3.5,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
    it('should get top statistic players with default sort and paging: STATUS 200', async () => {
      const res = await request(server)
        .get('/pair-game-quiz/users/top')
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });
      //3 users have part in game => 3 statistics
      expect(res.body.items).toHaveLength(3);
      //first in array should be first player(Bobby)
      expect(res.body.items[0]).toEqual({
        player: {
          id: expect.any(String),
          login: UsersConstants.valid_user_1.login,
        },
        sumScore: 17,
        avgScores: 4.25,
        gamesCount: 4,
        winsCount: 1,
        lossesCount: 2,
        drawsCount: 1,
      });
      //second should be second player(Emily)
      expect(res.body.items[1]).toEqual({
        player: {
          id: expect.any(String),
          login: UsersConstants.valid_user_2.login,
        },
        sumScore: 8,
        avgScores: 4,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 1,
      });
      //last should be third player(Liam)
      expect(res.body.items[2]).toEqual({
        player: {
          id: expect.any(String),
          login: UsersConstants.valid_user_3.login,
        },
        sumScore: 7,
        avgScores: 3.5,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 1,
        drawsCount: 0,
      });
    });
    it('should get top statistic players with default sort, pageNumber=2, pageSize=1: STATUS 200', async () => {
      const res = await request(server)
        .get('/pair-game-quiz/users/top?pageNumber=2&pageSize=1')
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 3,
        page: 2,
        pageSize: 1,
        totalCount: 3,
        items: expect.any(Array),
      });
      //page number = 1 => 1 object in array
      expect(res.body.items).toHaveLength(1);

      //in second page should be second player(Emily)
      expect(res.body.items[0]).toEqual({
        player: {
          id: expect.any(String),
          login: UsersConstants.valid_user_2.login,
        },
        sumScore: 8,
        avgScores: 4,
        gamesCount: 2,
        winsCount: 1,
        lossesCount: 0,
        drawsCount: 1,
      });
    });
    it('should get top statistic players with default paging, sort = ["avgScores asc"]: STATUS 200', async () => {
      const result = await request(server)
        .get('/pair-game-quiz/users/top?sort=avgScores asc')
        .expect(HttpStatus.OK);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });

      //3 users have part in game => 3 statistics
      expect(result.body.items).toHaveLength(3);
      //first in array should be third player(Liam)
      expect(result.body.items[0].player.login).toBe(
        UsersConstants.valid_user_3.login,
      );
      //second should be second player(Emily)
      expect(result.body.items[1].player.login).toBe(
        UsersConstants.valid_user_2.login,
      );
      //last should be first player(Bobby)
      expect(result.body.items[2].player.login).toBe(
        UsersConstants.valid_user_1.login,
      );
    });
    it('should get top statistic players with default paging, sort = ["gamesCount asc","avgScores desc"]: STATUS 200', async () => {
      const result = await request(server)
        .get(
          '/pair-game-quiz/users/top?sort=gamesCount asc&sort=avgScores desc',
        )
        .expect(HttpStatus.OK);

      expect(result.body).toEqual({
        pagesCount: 1,
        page: 1,
        pageSize: 10,
        totalCount: 3,
        items: expect.any(Array),
      });

      //3 users have part in game => 3 statistics
      expect(result.body.items).toHaveLength(3);
      //first in array should be second player(Emily)
      expect(result.body.items[0].player.login).toBe(
        UsersConstants.valid_user_2.login,
      );
      //second should be third player(Liam)
      expect(result.body.items[1].player.login).toBe(
        UsersConstants.valid_user_3.login,
      );
      //last should be first player(Bobby)
      expect(result.body.items[2].player.login).toBe(
        UsersConstants.valid_user_1.login,
      );
    });
  });

  describe('DELETE ALL DATA 5', () => {
    it('should delete all data', async () => {
      await request(server).delete('/testing/all-data').expect(204);
    });
  });

  describe('FINISH THE GAME IN 10 SEC', () => {
    let tokens;
    let firstGame;
    let secondGame;
    beforeAll(async () => {
      //create 10 questions by sa
      const questions = await createSeveralQuestions(5, server);

      //publish 5 questions by sa
      for (let i = 0; i < 5; i++) {
        await publishOrUnpublishQuestion(
          server,
          questions[i].id,
          QuestionsConstants.publish,
        );
      }

      //create 2 users by sa
      await createSeveralUsers(2, server);

      //login 2 users
      tokens = await loginSeveralUsers(2, server);
    });
    it('should connect to game 2 users: STATUS 200', async () => {
      //connect first user and second user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      firstGame = await connectUserToGameHelper(tokens[1].accessToken, server);

      // find game for current user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: firstGame.body.id,
        status: GameStatusModel.active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
    it('should add 5 answers by first user and 4 answers by second user: STATUS 200', async () => {
      //add 1 answer of first user
      await addAnswersByUserHelper(['null'], tokens[0].accessToken, server);
      //add 1 answer of second user
      await addAnswersByUserHelper(['null'], tokens[1].accessToken, server);
      //add 2 answer of first user
      await addAnswersByUserHelper(['0'], tokens[0].accessToken, server);
      //add 2 answer of second user
      await addAnswersByUserHelper(['0'], tokens[1].accessToken, server);
      //add 3 answer of first user
      await addAnswersByUserHelper(['007'], tokens[0].accessToken, server);
      //add 3 answer of second user
      await addAnswersByUserHelper(['007'], tokens[1].accessToken, server);
      //add 4 answer of first user
      await addAnswersByUserHelper(['nothing'], tokens[0].accessToken, server);
      //add 4 answer of second user
      await addAnswersByUserHelper(['anything'], tokens[1].accessToken, server);
      //add 5 answer of first user
      await addAnswersByUserHelper(['zero'], tokens[0].accessToken, server);
    });
    it('should get the game to current user: Status 200', async () => {
      // find game for current user
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: firstGame.body.id,
        status: GameStatusModel.active,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: null,
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
    it('should wait 10 seconds', async () => {
      await delay(10000);
    }, 12000);
    it('should finish the game after 10 sec: STATUS 200', async () => {
      // after 10 sec game finished and second user can add answer
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: 'answer' })
        .expect(HttpStatus.FORBIDDEN);

      // find game for current user
      await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.NOT_FOUND);

      // find game for current user
      const res = await request(server)
        .get(`/pair-game-quiz/pairs/${firstGame.body.id}`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: firstGame.body.id,
        status: GameStatusModel.finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
    it('should connect to game 2 users, add 5 correct answers by first user and 3 correct answers by second user: STATUS 200', async () => {
      //connect first user and second user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      secondGame = await connectUserToGameHelper(tokens[1].accessToken, server);

      // find correct answers
      const answers = await dataSource.query(
        `
      select g."id" as "gameId", array(
        select row_to_json(row) from(
            select qq."questionId" as "id", qq."body", qq."correctAnswers" from (
                select * from "question_of_game" qg
                left join "question" q
                on q."id" = qg."questionId"
                order by qg."addedAt"  asc) qq
            where qq."gameId" = g."id")
        as row)
      as questions
      from "game" g
      where g."id" = $1`,
        [secondGame.body.id],
      );

      //add 1 answer of first user
      await addAnswersByUserHelper(
        [answers[0].questions[0].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
      //add 1 answer of second user
      await addAnswersByUserHelper(
        [answers[0].questions[0].correctAnswers[0]],
        tokens[1].accessToken,
        server,
      );
      //add 2 answer of first user
      await addAnswersByUserHelper(
        [answers[0].questions[1].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
      //add 2 answer of second user
      await addAnswersByUserHelper(
        [answers[0].questions[1].correctAnswers[0]],
        tokens[1].accessToken,
        server,
      );
      //add 3 answer of first user
      await addAnswersByUserHelper(
        [answers[0].questions[2].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
      //add 3 answer of second user
      await addAnswersByUserHelper(
        [answers[0].questions[2].correctAnswers[0]],
        tokens[1].accessToken,
        server,
      );
      //add 4 answer of first user
      await addAnswersByUserHelper(
        [answers[0].questions[3].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
      //add 5 answer of first user
      await addAnswersByUserHelper(
        [answers[0].questions[4].correctAnswers[0]],
        tokens[0].accessToken,
        server,
      );
    });
    it('should wait 10 seconds ', async () => {
      await delay(10000);
    }, 12000);
    it('should finish the game after 10 sec with bonus point for first user: STATUS 200', async () => {
      // after 10 sec game finished and second user can add answer
      await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: 'answer' })
        .expect(HttpStatus.FORBIDDEN);

      // find game for current user
      await request(server)
        .get('/pair-game-quiz/pairs/my-current')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .expect(HttpStatus.NOT_FOUND);

      // find game for current user
      const res = await request(server)
        .get(`/pair-game-quiz/pairs/${secondGame.body.id}`)
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        id: secondGame.body.id,
        status: GameStatusModel.finished,
        pairCreatedDate: expect.any(String),
        startGameDate: expect.any(String),
        finishGameDate: expect.any(String),
        questions: expect.any(Array),
        firstPlayerProgress: {
          score: 6,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 3,
          answers: expect.any(Array),
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
  });

  // afterAll(async () => {
  //   await request(server).delete('/testing/all-data').expect(204);
  // });

  afterAll(async () => {
    await app.close();
  });
});
