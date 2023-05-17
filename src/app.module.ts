import { configModule } from './configuration/configModule'; //should be first in imports
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DeleteAllDataController } from './modules/deleteAllData/deleteAllData.controller';
import { ConfigService } from '@nestjs/config';
import { SuperAdminModule } from './modules/superAdmin/superAdmin.module';
import { BloggerModule } from './modules/bloggers/blogger.module';
import { PublicModule } from './modules/public/public.module';
import { ConfigType } from './configuration/configuration';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) =>
        configService.get('dbSettings', {
          infer: true,
        }) as TypeOrmModuleOptions,
    }),
    SuperAdminModule,
    BloggerModule,
    PublicModule,
  ],
  controllers: [AppController, DeleteAllDataController],
  providers: [AppService],
})
export class AppModule {}
