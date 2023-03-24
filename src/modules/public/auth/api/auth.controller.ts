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
import { MeViewType } from '../types/meViewType';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { UsersQueryRepository } from '../repositories/usersQuery.repository';
import { UserInfoRtType } from '../types/userIdDeviceIdType';
import { CurrentUserInfoAndDeviceId } from '../../../../helpers/decorators/currentUserIdDeviceId';
import { RefreshTokenGuard } from '../guards/refreshTokenAuth.guard';
import { DeleteDeviceCommand } from '../../devices/useCases/deleteDevice.useCase';
import { AccessTokenViewType } from '../types/accessTokenViewType';
import { UpdateRTMetaCommand } from '../useCases/updateRTMeta.useCase';
import { CodePipe } from './pipes/codePipe';
import { ConfirmEmailCommand } from '../useCases/confirmEmail.useCase';
import { EmailPipe } from './pipes/emailPipe';
import { CheckEmailIsConfirmedCommand } from '../useCases/checkEmailIsConfirmed.useCase';
import { CreateRecoveryCodeCommand } from '../useCases/createRecoveryCode.useCase';
import { NewPassRecoveryDtoPipe } from './pipes/newPassRecoveryDtoPipe';
import { ChangePasswordCommand } from '../useCases/changePassword.useCase';
import { ThrottlerGuard } from '@nestjs/throttler';
import { userInputModelPipe } from '../../../superAdmin/api/pipes/users.pipes/userInputDtoPipe';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly jwtAdapter: JwtAdapter,
    private commandBus: CommandBus,
  ) {}

  @Post('login')
  @UseGuards(/*ThrottlerGuard,*/ PasswordAuthGuard)
  @HttpCode(200)
  async login(
    @CurrentUserInfo() userInfo: UserInfoType,
    @Ip() ip: string,
    @Headers('user-agent') deviceTitle: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.commandBus.execute(
      new CreateRTMetaCommand(userInfo.id, userInfo.login, ip, deviceTitle),
    );
    console.log('refreshToken:', tokens.refreshToken);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }

  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMyProfile(@CurrentUserId() userId: string): Promise<MeViewType> {
    const user = await this.usersQueryRepository.getMyProfile(userId);
    if (!user) throw new NotFoundException('Can`t find your profile');
    return user;
  }

  @Post('registration')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registration(
    @Body() userInputModel: userInputModelPipe,
  ): Promise<void> {
    await this.commandBus.execute(
      new UserRegistrationCommand(
        userInputModel.login,
        userInputModel.email,
        userInputModel.password,
      ),
    );
    return;
  }

  @Post('registration-confirmation')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registrationConfirmation(@Body() codeDto: CodePipe): Promise<void> {
    await this.commandBus.execute(new ConfirmEmailCommand(codeDto.code));
    return;
  }

  @Post('registration-email-resending')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async registrationEmailResending(@Body() emailDto: EmailPipe): Promise<void> {
    await this.commandBus.execute(new CheckEmailIsConfirmedCommand(emailDto));
    return;
  }

  @Post('refresh-token')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(200)
  async updateTokens(
    @CurrentUserInfoAndDeviceId() userInfo: UserInfoRtType,
    @Ip() ip: string,
    @Headers('user-agent') deviceTitle: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AccessTokenViewType> {
    const tokens = await this.commandBus.execute(
      new UpdateRTMetaCommand(
        userInfo.id,
        userInfo.login,
        userInfo.deviceId,
        ip,
        deviceTitle,
      ),
    );
    console.log(tokens.refreshToken);
    response.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return tokens.accessToken;
  }

  @Post('logout')
  @UseGuards(RefreshTokenGuard)
  @HttpCode(204)
  async logout(
    @CurrentUserInfoAndDeviceId() userInfo: UserInfoRtType,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteDeviceCommand(userInfo.deviceId, userInfo.id),
    );
    response.clearCookie('refreshToken');
    return;
  }

  @Post('password-recovery')
  @UseGuards(ThrottlerGuard)
  async passwordRecovery(@Body() emailInputDto: EmailPipe): Promise<void> {
    await this.commandBus.execute(
      new CreateRecoveryCodeCommand(emailInputDto.email),
    );
    return;
  }

  @Post('new-password')
  @UseGuards(ThrottlerGuard)
  @HttpCode(204)
  async newPassword(
    @Body() newPassRecoveryDto: NewPassRecoveryDtoPipe,
  ): Promise<void> {
    await this.commandBus.execute(
      new ChangePasswordCommand(
        newPassRecoveryDto.newPassword,
        newPassRecoveryDto.recoveryCode,
      ),
    );
    return;
  }
}
