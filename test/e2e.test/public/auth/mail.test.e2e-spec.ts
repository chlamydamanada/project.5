import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MailBoxImap } from './imap.service';
import { isUUID } from 'class-validator';
import { AppModule } from '../../../../src/app.module';
import { Test } from '@nestjs/testing';
import { appInitSettings } from '../../../../src/configuration/appInitSettings';

describe('Testing auth public controller', () => {
  jest.setTimeout(60 * 1000);
  let app: INestApplication;
  let server: any;
  //let dataSource;
  beforeAll(async () => {
    //connection:
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    // connecting global pipe and filter
    appInitSettings(app);
    await app.init();

    //connecting to imap
    const mailBox = new MailBoxImap();
    await mailBox.connectToMail();
    expect.setState({ mailBox });

    //connecting to db:
    //dataSource = await app.resolve(DataSource);
    server = app.getHttpServer();
  });
  beforeAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  describe('Check email sending with confirmation code', () => {
    let code_1;
    it('should create new User and return 204 status code', async () => {
      const response = await request(server).post('/auth/registration').send({
        login: 'keksik',
        email: process.env.IMAP_YANDEX_EMAIL,
        password: '123456789',
      });
      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
    });

    it('should read email and get validConfirmationCode', async () => {
      //extract html from email
      const mailBox: MailBoxImap = expect.getState().mailBox;
      const email = await mailBox.waitNewMessage(0.5);
      const html = await mailBox.getMessageHtml(email);

      //check existence of html
      expect(html).not.toBeNull();

      //extract confirmation code from html
      code_1 = html?.split('code=')[1].split(`'>`)[0];

      //check existence of code
      expect(code_1).not.toBeNull();
      expect(code_1).not.toBeUndefined();
      expect(isUUID(code_1)).toBeTruthy();
      // if (isUuid) await mailBox.deleteAllTodayMessages();
      //expect.setState({ validConfirmationCode });
    });
  });

  afterAll(async () => {
    await request(server).delete('/testing/all-data').expect(204);
  });

  afterAll(async () => {
    //disconnect imap
    const mailBox: MailBoxImap = expect.getState().mailBox;
    await mailBox.disconnect();
    // disconnect app
    await app.close();
  });
});
