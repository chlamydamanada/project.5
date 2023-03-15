import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccessTokenStrategyType } from '../types/accessTokenStrategyType';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(
    payload: AccessTokenStrategyType,
  ): Promise<{ id: string; login: string }> {
    //console.log('AccessTokenStrategy:', payload);
    if (!payload) throw new UnauthorizedException();
    return { id: payload.userId, login: payload.userLogin };
  }
}
