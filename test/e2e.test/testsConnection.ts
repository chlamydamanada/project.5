import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { INestApplication } from '@nestjs/common';
import { MailService } from '../../src/adapters/email/email.service';
import { MailServiceMock } from '../integration.test/public/mocks/mailServiceMock';
import { appInitSettings } from '../../src/configuration/appInitSettings';

export const getApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(MailService)
    .useValue(MailServiceMock) // mock mail service
    .compile();
  const app: INestApplication = moduleFixture.createNestApplication();
  //turn on cookieParser, GlobalPipes, GlobalFilters
  appInitSettings(app);
  await app.init();
  return app;
};
