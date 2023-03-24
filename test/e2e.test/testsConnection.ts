import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { HttpExceptionFilter } from '../../exception.filter';
import { useContainer } from 'class-validator';

export const getApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app: INestApplication = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      //transformOptions: { enableImplicitConversion: true },
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const result = errors.map((e) => ({
          message: Object.values(e.constraints!)[0],
          field: e.property,
        }));
        throw new BadRequestException(result);
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.init();
  return app;
};
