import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  cache: true,
});
