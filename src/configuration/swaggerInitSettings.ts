import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PostPublicController } from '../modules/public/posts/api/postPublic.controller';

export const swaggerInitSettings = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .addBearerAuth({ type: 'http', description: 'Enter JWT Bearer token only' })
    .addBasicAuth()
    .addCookieAuth('refreshToken')
    .setTitle('API')
    .setDescription('API description')
    .setVersion('1.0')
    .addTag('Blogger')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);
};
