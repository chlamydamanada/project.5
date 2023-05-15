import { config } from 'dotenv';
import { localTypeOrmConfig, typeOrmConfig } from './typeOrmConfigSettings';
config();

export const getConfigurationEnv = () => ({
  Port: parseInt(process.env.PORT ?? '5000', 10),
  jwtSettings: {
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    EXPIRED_REFRESH: process.env.EXPIRED_REFRESH,
    EXPIRED_ACCESS: process.env.EXPIRED_ACCESS,
  },
  emailSettings: {
    MAIL_USER: process.env.MAIL_USER,
    MAIL_PASSWORD: process.env.MAIL_PASSWORD,
    MAIL_FROM: process.env.MAIL_FROM,
    MAIL_SERVICE: process.env.MAIL_SERVICE,
  },
  dbSettings: process.env.LOCAL_DB ? localTypeOrmConfig : typeOrmConfig,
});

//console.log(process.env.ACCESS_TOKEN_SECRET);
export type ConfigType = ReturnType<typeof getConfigurationEnv>;
