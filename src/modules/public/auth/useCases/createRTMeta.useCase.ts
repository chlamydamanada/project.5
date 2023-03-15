import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { DevicesRepository } from '../../devices/repositories/device.repository';
import { TokensType } from '../types/tokensType';
import { JwtAdapter } from '../../../../adapters/jwt/jwtAdapter';

export class CreateRTMetaCommand {
  constructor(
    public userId: string,
    public userLogin: string,
    public ip: string,
    public deviceTitle: string,
  ) {}
}
@CommandHandler(CreateRTMetaCommand)
export class CreateRTMetaUseCase
  implements ICommandHandler<CreateRTMetaCommand>
{
  constructor(
    private readonly jwtAdapter: JwtAdapter,
    private readonly devicesRepository: DevicesRepository,
  ) {}
  async execute(command: CreateRTMetaCommand): Promise<TokensType> {
    const deviceId = uuidv4();
    //  create refresh token
    const refreshToken = await this.jwtAdapter.createRefreshToken(
      command.userId,
      command.userLogin,
      deviceId,
    );
    // create access token
    const accessToken = await this.jwtAdapter.createAccessToken(
      command.userId,
      command.userLogin,
    );
    // decode token to take iat and exp
    const tokenInfo: any = this.jwtAdapter.decodeToken(refreshToken);
    // create device session
    await this.devicesRepository.createDevice(
      tokenInfo.deviceId,
      command.ip,
      command.deviceTitle,
      tokenInfo.userId,
      tokenInfo.iat!,
      tokenInfo.exp!,
    );
    return { refreshToken, accessToken };
  }
}
