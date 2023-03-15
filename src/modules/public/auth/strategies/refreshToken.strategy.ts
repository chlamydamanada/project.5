import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenStrategyType } from '../types/refreshTokenStrategyType';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { DevicesRepository } from '../../devices/repositories/device.repository';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly devicesRepository: DevicesRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const data = request.cookies.refreshToken;
          if (!data) return null;
          return data;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
    });
  }

  async validate(
    payload: RefreshTokenStrategyType,
  ): Promise<{ id: string; login: string; deviceId: string }> {
    const device = await this.devicesRepository.findDeviceByDeviceId(
      payload.deviceId,
    );
    if (!device) throw new UnauthorizedException('refresh token not found');
    if (payload.iat !== device.lastActiveDate)
      throw new UnauthorizedException('refresh token is already invalid');

    //console.log('RefreshTokenStrategy:', payload);
    return {
      id: payload.userId,
      login: payload.userLogin,
      deviceId: payload.deviceId,
    };
  }
}
