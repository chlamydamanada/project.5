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
import { delay } from '../../../delayFunction';
import { DataSource } from 'typeorm';
import { connectUserToGameHelper } from '../../helpers/quizGame/connectionToGame.helper';
import { addAnswersByUserHelper } from '../../helpers/quizGame/addAnswersByUser.helper';

describe('Testing QUIZ GAME', () => {
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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });
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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
      expect(startGame.body.questions).toHaveLength(5);
    });
    it('shouldn`t connection to game if current user hasn`t finished the first game yet(create new game): STATUS 403', async () => {
      await request(server)
        .post('/pair-game-quiz/pairs/connection')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.FORBIDDEN);
    });
  });

  describe('DELETE ALL DATA', () => {
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
SELECT q."body", q."correctAnswers" FROM public."game" g 
LEFT JOIN "question_of_game" qg ON qg."gameId" = g."id"
LEFT JOIN "question" q ON qg."questionId" = q."id"
WHERE g."id" = $1`,
        [firstGame.body.id],
      );

      // add correct answer by first user the first question
      const firstRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .send({ answer: firstActiveGameQuestions[0].correctAnswers[0] })
        .expect(HttpStatus.OK);

      expect(firstRes.body).toEqual({
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
        questionId: expect.any(String),
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
      await delay(500);

      //add incorrect answer by second user the third question
      const secondRes = await request(server)
        .post('/pair-game-quiz/pairs/my-current/answers')
        .set('Authorization', `Bearer ${tokens[1].accessToken}`)
        .send({ answer: 'string' })
        .expect(HttpStatus.OK);

      expect(secondRes.body).toEqual({
        questionId: expect.any(String),
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
WHERE g."id" = $1`,
        [secondGame.body.id],
      );

      //first user answer to questions(all answers are incorrect): no bonus!
      await addAnswersByUserHelper(
        ['null', 'null', 'no', 'lol', 'nothing'],
        tokens[0].accessToken,
        server,
      );

      await delay(500);

      //second user answer to questions(only first answer is correct): no bonus
      await addAnswersByUserHelper(
        [
          secondActiveGameQuestions[0].correctAnswers[0],
          'null',
          'no',
          'lol',
          'nothing',
        ],
        tokens[1].accessToken,
        server,
      );
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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });
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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
    it('should find game by id (status: Finished): STATUS 200', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        ['ten', 'twelve', 'six', 'two', 'nothing'],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        ['two', 'nothing', 'ten', 'six', 'twelve'],
        tokens[1].accessToken,
        server,
      );

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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: null,
      });
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
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_1.login,
          },
        },
        secondPlayerProgress: {
          score: 0,
          answers: null,
          player: {
            id: expect.any(String),
            login: UsersConstants.valid_user_2.login,
          },
        },
      });
    });
    it('shouldn`t get game with status Finished for current user: STATUS 404 ', async () => {
      //add answers of first user
      await addAnswersByUserHelper(
        ['ten', 'twelve', 'six', 'two', 'nothing'],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        ['two', 'nothing', 'ten', 'six', 'twelve'],
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

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
