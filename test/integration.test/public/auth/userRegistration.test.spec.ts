import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../../../../src/adapters/email/email.service';
import { UserRegistrationUseCase } from '../../../../src/modules/public/auth/useCases/userRegistration.useCase';
import { MailServiceMock } from '../mocks/mailServiceMock';
import { AppModule } from '../../../../src/app.module';

describe('Testing REGISTRATION USER use case', () => {
  let app: INestApplication;
  let useCase;
  //connections:
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MailService)
      .useValue(MailServiceMock)
      .compile();
    useCase = module.get<UserRegistrationUseCase>(UserRegistrationUseCase);
    app = module.createNestApplication();
    await app.init();
  });
  //before all drop db
  describe('should register user with correct data and send email with confirmation code', () => {
    it('should register user with correct data and send email with confirmation code', async () => {
      await useCase.execute({
        login: 'keksik',
        password: '123456789',
        email: 'keksik@gmail.com',
      });
      expect(MailServiceMock.sendRegistrationEmail).toBeCalledTimes(1);
    });
    it('shouldn`t register user twice', async () => {
      await expect(
        useCase.execute({
          login: 'keksik',
          password: '123456789',
          email: 'keksik@gmail.com',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
