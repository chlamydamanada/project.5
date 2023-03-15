import { UserInfoType } from '../types/userInfoType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../devices/repositories/device.repository';
import { UpdateDeviceDtoType } from '../../devices/devicesTypes/updateDeviceDtoType';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { TokensType } from '../types/tokensType';
import { JwtAdapter } from '../../../../adapters/jwt/jwtAdapter';

export class UpdateRTMetaCommand {
  constructor(
    public userId: string,
    public userLogin: string,
    public deviceId: string,
    public ip: string,
    public deviceTitle: string,
  ) {}
}
@CommandHandler(UpdateRTMetaCommand)
export class UpdateRTMetaUseCase
  implements ICommandHandler<UpdateRTMetaCommand>
{
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly devicesRepository: DevicesRepository,
  ) {}
  async execute(command: UpdateRTMetaCommand): Promise<TokensType> {
    // create refresh token
    const refreshToken = await this.jwtAdapter.createRefreshToken(
      command.userId,
      command.userLogin,
      command.deviceId,
    );

    // create access token
    const accessToken = await this.jwtAdapter.createAccessToken(
      command.userId,
      command.userLogin,
    );

    // decode token to take iat and exp
    const tokenInfo: any = this.jwtAdapter.decodeToken(refreshToken);

    // update device session
    await this.devicesRepository.updateDevice(
      command.deviceId,
      command.ip,
      command.deviceTitle,
      tokenInfo.iat!,
      tokenInfo.exp!,
    );

    return { refreshToken, accessToken };
  }
}
