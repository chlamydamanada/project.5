import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appInitSettings } from './configuration/appInitSettings';
import { swaggerInitSettings } from './configuration/swaggerInitSettings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //turn on cookieParser, GlobalPipes, GlobalFilters
  appInitSettings(app);
  // turn on swagger
  swaggerInitSettings(app);

  await app.listen(3000);
}

bootstrap();
