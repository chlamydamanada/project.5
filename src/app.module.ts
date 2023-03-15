import { configModule } from './configuration/configModule'; //should be first in imports
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from './adapters/email/email.module';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { BcryptAdapter } from './adapters/bcrypt/bcryptAdapter';
import { SaController } from './modules/superAdmin/api/sa.controller';
import { CreateUserUseCase } from './modules/superAdmin/application/users.useCases/createUser.useCase';
import { UsersRepositoryToSA } from './modules/superAdmin/repositories/usersToSA.repository';
import { UsersQueryRepositoryToSA } from './modules/superAdmin/api/query.repositories/usersQuery.postgresql.repository';
import { User } from './modules/superAdmin/domain/users.entities/user.entity';
import { BanInfo } from './modules/superAdmin/domain/users.entities/banInfo.entity';
import { EmailConfirmationInfo } from './modules/superAdmin/domain/users.entities/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from './modules/superAdmin/domain/users.entities/passwordRecoveryInfo.entity';
import { DeleteUserUseCase } from './modules/superAdmin/application/users.useCases/deleteUser.useCase';
import { BanOrUnbanUserUseCase } from './modules/superAdmin/application/users.useCases/banOrUnbanUser.useCase';
import { Device } from './modules/public/devices/domain/device.entity';
import { AuthController } from './modules/public/auth/api/auth.controller';
import { CreateRTMetaUseCase } from './modules/public/auth/useCases/createRTMeta.useCase';
import { DevicesRepository } from './modules/public/devices/repositories/device.repository';
import { DevicesQueryRepository } from './modules/public/devices/api/qweryRepositories/deviceQwery.repository';
import { JwtAdapter } from './adapters/jwt/jwtAdapter';
import { CheckCredentialsUseCase } from './modules/public/auth/useCases/checkCredentials.useCase';
import { UsersRepository } from './modules/public/auth/repositories/users.repository';
import { PasswordStrategy } from './modules/public/auth/strategies/pass.strategy';
import { UsersQueryRepository } from './modules/public/auth/repositories/usersQuery.repository';
import { UserRegistrationUseCase } from './modules/public/auth/useCases/userRegistration.useCase';
import { DevicesRepositoryToSA } from './modules/superAdmin/repositories/devicesToSA.repository';
import { AccessTokenStrategy } from './modules/public/auth/strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './modules/public/auth/strategies/refreshToken.strategy';
import { DeleteAllDataController } from './modules/deleteAllData/deleteAllData.controller';
import { DevicesController } from './modules/public/devices/api/device.controller';
import { ChangePasswordUseCase } from './modules/public/auth/useCases/changePassword.useCase';
import { CheckEmailIsConfirmedUseCase } from './modules/public/auth/useCases/checkEmailIsConfirmed.useCase';
import { ConfirmEmailUseCase } from './modules/public/auth/useCases/confirmEmail.useCase';
import { CreateRecoveryCodeUseCase } from './modules/public/auth/useCases/createRecoveryCode.useCase';
import { UpdateRTMetaUseCase } from './modules/public/auth/useCases/updateRTMeta.useCase';
import { DeleteAllDevicesExceptThisUseCase } from './modules/public/devices/useCases/deleteAllDevicesExceptThis.useCase';
import { DeleteDeviceUseCase } from './modules/public/devices/useCases/deleteDevice.useCase';
import { ConfigService } from '@nestjs/config';
//import { IsBlogExistValidator } from './helpers/validators/isBlogExistById.validator';

const repositories = [
  UsersRepositoryToSA,
  UsersQueryRepositoryToSA,
  UsersRepository,
  UsersQueryRepository,
  DevicesRepository,
  DevicesQueryRepository,
  DevicesRepositoryToSA,
];
const useCases = [
  BanOrUnbanUserUseCase,
  ChangePasswordUseCase,
  CheckCredentialsUseCase,
  CheckEmailIsConfirmedUseCase,
  ConfirmEmailUseCase,
  CreateRecoveryCodeUseCase,
  CreateRTMetaUseCase,
  CreateUserUseCase,
  DeleteAllDevicesExceptThisUseCase,
  DeleteDeviceUseCase,
  DeleteUserUseCase,
  UpdateRTMetaUseCase,
  UserRegistrationUseCase,
];
const strategies = [
  PasswordStrategy,
  AccessTokenStrategy,
  RefreshTokenStrategy,
];
const validators = [];
const adapters = [BcryptAdapter, JwtAdapter];

@Module({
  imports: [
    configModule,
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DB_URL'),
        //host: configService.get('DB_HOST'),
        //port: parseInt(<string>configService.get('DB_PORT')),
        //username: configService.get('DB_USER_NAME'),
        //password: configService.get('DB_PASS'),
        //database: configService.get('DB_NAME'),
        // entities: [],
        ssl: true,
        autoLoadEntities: true,
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      BanInfo,
      EmailConfirmationInfo,
      PasswordRecoveryInfo,
      Device,
    ]),
    PassportModule,
    MailModule, // 📧
    JwtModule.register({}),
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    CqrsModule,
  ],
  controllers: [
    AppController,
    AuthController,
    DeleteAllDataController,
    DevicesController,
    SaController,
  ],
  providers: [
    AppService,
    ...useCases,
    ...repositories,
    ...strategies,
    ...validators,
    ...adapters,
  ],
})
export class AppModule {}
