import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PostPublicController } from '../modules/public/posts/api/postPublic.controller';
import { PublicModule } from '../modules/public/public.module';
import { BloggerModule } from '../modules/bloggers/blogger.module';
import { SuperAdminModule } from '../modules/superAdmin/superAdmin.module';

export const swaggerInitSettings = (app: INestApplication) => {
  //swagger for public part
  const publicOptions = new DocumentBuilder()
    .addBearerAuth({ type: 'http', description: 'Enter JWT Bearer token only' })
    .addCookieAuth('refreshToken')
    .setTitle('Public API')
    .setDescription('Public API for all users with or without authorization')
    .setVersion('1.0')
    .build();

  const publicDocument = SwaggerModule.createDocument(app, publicOptions, {
    include: [PublicModule],
  });
  SwaggerModule.setup('swagger/public', app, publicDocument);

  //swagger for blogger part
  const bloggerOptions = new DocumentBuilder()
    .addBearerAuth({ type: 'http', description: 'Enter JWT Bearer token only' })
    .setTitle('Blogger API')
    .setDescription('Blogger API only for users with authorization')
    .setVersion('1.0')
    .build();

  const bloggerDocument = SwaggerModule.createDocument(app, bloggerOptions, {
    include: [BloggerModule],
  });
  SwaggerModule.setup('swagger/blogger', app, bloggerDocument);

  //swagger for sa part
  const saOptions = new DocumentBuilder()
    .addBasicAuth()
    .setTitle('Super Admin API')
    .setDescription('Super Admin API only for Super Admin')
    .setVersion('1.0')
    .build();

  const saDocument = SwaggerModule.createDocument(app, saOptions, {
    include: [SuperAdminModule],
  });
  SwaggerModule.setup('swagger/sa', app, saDocument);
};
