import { configModule } from './configuration/configModule'; //should be first in imports
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteAllDataController } from './modules/deleteAllData/deleteAllData.controller';
import { ConfigService } from '@nestjs/config';
import { SuperAdminModule } from './modules/superAdmin/superAdmin.module';
import { BloggerModule } from './modules/bloggers/blogger.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        // url: configService.get('DB_URL'),
        host: configService.get('DB_HOST'),
        port: parseInt(<string>configService.get('DB_PORT')),
        username: configService.get('DB_USER_NAME'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_NAME'),
        // entities: [],
        // ssl: true,
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
    }),
    SuperAdminModule,
    BloggerModule,
    PublicModule,
  ],
  controllers: [AppController, DeleteAllDataController],
  providers: [AppService],
})
export class AppModule {}
