/*import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule } from '@nestjs/jwt';
import { UsersMongoRepository } from '../../../superAdmin/users/repositories/users.mongo.repositories';
import { UserModel } from '../../../superAdmin/users/domain/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { configModule } from '../../../../../configuration/configModule';
import { DeviceModel } from '../../devices/domain/device.schema';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MailService } from '../../../../../adapters/email/email.service';
import { INestApplication } from '@nestjs/common';
import { MailServiceMock } from '../../../../../test/integration/emailServiceMock';*/

/*
describe('integration test for AuthService', () => {
  //let authService: AuthService;
  let app: INestApplication;
  let useCase;
  //connections:
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(mongoUri),
        MongooseModule.forFeature([UserModel, DeviceModel]),
        configModule,
        JwtModule.register({}),
      ],
      providers: [AuthService, UsersService, UsersMongoRepository, MailService],
    })
      .overrideProvider(MailService)
      .useValue(MailServiceMock)
      .compile();
      useCase = module.get<UserRegistrationUseCase>(UserRegistrationUseCase)
    app = module.createNestApplication();
    await app.init();
    authService = module.get<AuthService>(AuthService);
  });

  describe('registration', () => {
    it('should register user', async () => {
      await useCase.execute({userDto:{
        login: 'keksik',
        password: '123456789',
        email: 'keksik@gmail.com',

      }});
      expect(MailServiceMock.sendRegistrationEmail).toBeCalledTimes(1);
    });
    it('shouldn`t register user', async () => {
      try {
        await authService.registerUser({
          login: 'keksik',
          password: '123456789',
          email: 'keksik@gmail.com',
        });
      } catch (e) {
        expect(e.message).toBe('Bad Request Exception');
      }
    });
  });
});*/
