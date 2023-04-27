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
import { AnswerStatusType } from '../../../../src/modules/public/quizGame/types/answerStatusType';

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
      await delay(500);

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

  describe('GET ALL GAMES OF CURRENT USER', () => {
    let tokens;
    let firstGame;
    let secondGame;
    let thirdGame;
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
      await createSeveralUsers(4, server);

      //login 4 users
      tokens = await loginSeveralUsers(4, server);
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
        ['nothing', 'ten', 'six', 'twelve', '777'],
        tokens[0].accessToken,
        server,
      );

      //add answers of second user
      await addAnswersByUserHelper(
        ['nothing', 'ten', 'six', 'twelve', '777'],
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
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
    });
    it('should find array with two games(finished and active) of current user: STATUS 200', async () => {
      //connect first user and third user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      secondGame = await connectUserToGameHelper(tokens[2].accessToken, server);

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
        ['nothing', 'ten', 'six', 'twelve', '777'],
        tokens[0].accessToken,
        server,
      );

      //add answers of third user
      await addAnswersByUserHelper(
        ['nothing', 'ten', 'six', 'twelve', '777'],
        tokens[2].accessToken,
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
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);

      //second in array should be first game: status finished, have 5 questions, 5 answers by both users
      expect(res.body.items[1].id).toBe(firstGame.body.id);
      expect(res.body.items[1].questions).toHaveLength(5);
      expect(res.body.items[1].status).toBe('Finished');
      expect(res.body.items[1].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[1].secondPlayerProgress.answers).toHaveLength(5);
    });
    it('should find array with one active and two finished games of current user: STATUS 200', async () => {
      //connect first user and second user to game
      await connectUserToGameHelper(tokens[0].accessToken, server);
      thirdGame = await connectUserToGameHelper(tokens[1].accessToken, server);

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

    it('should get array of one game with sortBy: status, pageSize 2, pageNumber 2, default sortDirection: STATUS 200', async () => {
      const res = await request(server)
        .get('/pair-game-quiz/pairs/my?sortBy=status&pageSize=2&pageNumber=2')
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
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
    it('should get array of one game with sortBy-status, pageSize-2, pageNumber-2, sortDirection-asc: STATUS 200', async () => {
      const res = await request(server)
        .get(
          '/pair-game-quiz/pairs/my?sortBy=status&pageSize=2&pageNumber=2&sortDirection=asc',
        )
        .set('Authorization', `Bearer ${tokens[0].accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({
        pagesCount: 2,
        page: 2,
        pageSize: 2,
        totalCount: 3,
        items: expect.any(Array),
      });

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].id).toBe(firstGame.body.id);
      expect(res.body.items[0].questions).toHaveLength(5);
      expect(res.body.items[0].status).toBe('Finished');
      expect(res.body.items[0].firstPlayerProgress.answers).toHaveLength(5);
      expect(res.body.items[0].secondPlayerProgress.answers).toHaveLength(5);
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await app.close();
  });
});
