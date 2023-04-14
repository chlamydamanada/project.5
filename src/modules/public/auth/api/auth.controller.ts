import { Response } from 'express';
import {
  Controller,
  HttpCode,
  Ip,
  Post,
  Res,
  Headers,
  UseGuards,
  Body,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAdapter } from '../../../../adapters/jwt/jwtAdapter';
import { CurrentUserInfo } from '../../../../helpers/decorators/currentUserIdAndLogin';
import { UserInfoType } from '../types/userInfoType';
import { CreateRTMetaCommand } from '../useCases/createRTMeta.useCase';
import { PasswordAuthGuard } from '../guards/pass.auth.guard';
import { UserRegistrationCommand } from '../useCases/userRegistration.useCase';
import { AccessTokenGuard } from '../guards/accessTokenAuth.guard';
import { MeViewModel } from '../types/meViewModel';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { UsersQueryRepository } from './query.repositories/usersQuery.repository';
import { UserInfoRtType } from '../types/userIdDeviceIdType';
import { CurrentUserInfoAndDeviceId } from '../../../../helpers/decorators/currentUserIdDeviceId';
import { RefreshTokenGuard } from '../guards/refreshTokenAuth.guard';
import { DeleteDeviceCommand } from '../../devices/useCases/deleteDevice.useCase';
import { AccessTokenViewModel } from '../types/accessTokenViewModel';
import { UpdateRTMetaCommand } from '../useCases/updateRTMeta.useCase';
import { CodeInputDto } from './pipes/codeInput.dto';
import { ConfirmEmailCommand } from '../useCases/confirmEmail.useCase';
import { EmailInputDto } from './pipes/emailInput.dto';
import { CheckEmailIsConfirmedCommand } from '../useCases/checkEmailIsConfirmed.useCase';
import { CreateRecoveryCodeCommand } from '../useCases/createRecoveryCode.useCase';
import { NewPassRecoveryDto } from './pipes/newPassRecovery.dto';
import { ChangePasswordCommand } from '../useCases/changePassword.useCase';
import { ApiTags } from '@nestjs/swagger';
import { TokensType } from '../types/tokensType';
import { ThrottlerGuard } from '@nestjs/throttler';
import { userCreateInputDto } from '../../../superAdmin/users/api/pipes/userCreateInput.dto';
import { LoginSwaggerDecorator } from '../../../../swagger/decorators/public/auth/login.swagger.decorator';
import { RegistrationSwaggerDecorator } from '../../../../swagger/decorators/public/auth/registration.swagger.decorator';
import { GetCurrentInfoSwaggerDecorator } from '../../../../swagger/decorators/public/auth/getCurrentInfo.swagger.decorator';
import { RegistrationConfirmationSwaggerDecorator } from '../../../../swagger/decorators/public/auth/registrationConfirmation.swagger.decorator';
import { RegistrationEmailResendingSwaggerDecorator } from '../../../../swagger/decorators/public/auth/registrationEmailResending.swagger.decorator';
import { RefreshTokenSwaggerDecorator } from '../../../../swagger/decorators/public/auth/refreshToken.swagger.decorator';
import { LogoutSwaggerDecorator } from '../../../../swagger/decorators/public/auth/logout.swagger.decorator';
import { PasswordRecoverySwaggerDecorator } from '../../../../swagger/decorators/public/auth/passwordRecovery.swagger.decorator';
import { NewPasswordSwaggerDecorator } from '../../../../swagger/decorators/public/auth/newPassword.swagger.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly jwtAdapter: JwtAdapter,
    private commandBus: CommandBus,
  ) {}

  @Post('login')
  @LoginSwaggerDecorator()
  @UseGuards(/*ThrottlerGuard,*/ PasswordAuthGuard)
  @HttpCode(200)
  async login(
    @CurrentUserInfo() userInfo: UserInfoType,
    @Ip() ip: string,
    @Headers('user-agent') deviceTitle: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.commandBus.execute<
      CreateRTMetaCommand,
      TokensType
    >(new CreateRTMetaCommand(userInfo.id, userInfo.login, ip, deviceTitle));
    //console.log('refreshToken:', tokens.refreshToken);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }

  @UseGuards(AccessTokenGuard)
  @GetCurrentInfoSwaggerDecorator()
  @Get('me')
  async getMyProfile(@CurrentUserId() userId: string): Promise<MeViewModel> {
    const user = await this.usersQueryRepository.getMyProfile(userId);
    if (!user) throw new NotFoundException('Can`t find your profile');
    return user;
  }

  @Post('registration')
  @RegistrationSwaggerDecorator()
  //@UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registration(
    @Body() userInputModel: userCreateInputDto,
  ): Promise<void> {
    await this.commandBus.execute<UserRegistrationCommand>(
      new UserRegistrationCommand(
        userInputModel.login,
        userInputModel.email,
        userInputModel.password,
      ),
    );
    return;
  }

  @Post('registration-confirmation')
  @RegistrationConfirmationSwaggerDecorator()
  //@UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() codeDto: CodeInputDto): Promise<void> {
    await this.commandBus.execute<ConfirmEmailCommand>(
      new ConfirmEmailCommand(codeDto.code),
    );
    return;
  }

  @Post('registration-email-resending')
  @RegistrationEmailResendingSwaggerDecorator()
  //@UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registrationEmailResending(
    @Body() emailDto: EmailInputDto,
  ): Promise<void> {
    await this.commandBus.execute<CheckEmailIsConfirmedCommand>(
      new CheckEmailIsConfirmedCommand(emailDto.email),
    );
    return;
  }

  @Post('refresh-token')
  @RefreshTokenSwaggerDecorator()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  async updateTokens(
    @CurrentUserInfoAndDeviceId() userInfo: UserInfoRtType,
    @Ip() ip: string,
    @Headers('user-agent') deviceTitle: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenViewModel> {
    const tokens = await this.commandBus.execute<
      UpdateRTMetaCommand,
      TokensType
    >(
      new UpdateRTMetaCommand(
        userInfo.id,
        userInfo.login,
        userInfo.deviceId,
        ip,
        deviceTitle,
      ),
    );
    //console.log(tokens.refreshToken);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }

  @Post('logout')
  @LogoutSwaggerDecorator()
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async logout(
    @CurrentUserInfoAndDeviceId() userInfo: UserInfoRtType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commandBus.execute<DeleteDeviceCommand>(
      new DeleteDeviceCommand(userInfo.deviceId, userInfo.id),
    );
    response.clearCookie('refreshToken');
    return;
  }

  @Post('password-recovery')
  @PasswordRecoverySwaggerDecorator()
  @HttpCode(204)
  //@UseGuards(ThrottlerGuard)
  async passwordRecovery(@Body() emailInputDto: EmailInputDto): Promise<void> {
    await this.commandBus.execute<CreateRecoveryCodeCommand>(
      new CreateRecoveryCodeCommand(emailInputDto.email),
    );
    return;
  }

  @Post('new-password')
  @NewPasswordSwaggerDecorator()
  //@UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async newPassword(
    @Body() newPassRecoveryDto: NewPassRecoveryDto,
  ): Promise<void> {
    await this.commandBus.execute<ChangePasswordCommand>(
      new ChangePasswordCommand(
        newPassRecoveryDto.newPassword,
        newPassRecoveryDto.recoveryCode,
      ),
    );
    return;
  }
}
