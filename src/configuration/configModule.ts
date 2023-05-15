import { ConfigModule } from '@nestjs/config';
import { getConfigurationEnv } from './configuration';
export const configModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
  load: [getConfigurationEnv],
  cache: true,
});
