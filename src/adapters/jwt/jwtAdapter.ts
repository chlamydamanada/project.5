import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { AccessTokenViewModel } from '../../modules/public/auth/types/accessTokenViewModel';

@Injectable()
export class JwtAdapter {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {}

  async createRefreshToken(
    userId: string,
    userLogin: string,
    deviceId: string,
  ): Promise<string> {
    const token = await this.jwtService.signAsync(
      {
        userId,
        userLogin,
        deviceId,
      },
      {
        expiresIn: '2000 seconds',
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      },
    );
    return token;
  }

  async createAccessToken(
    userId: string,
    userLogin: string,
  ): Promise<AccessTokenViewModel> {
    const token = await this.jwtService.signAsync(
      { userId, userLogin },
      {
        expiresIn: '1000 seconds',
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
      },
    );
    return {
      accessToken: token,
    };
  }

  decodeToken(token: string) {
    return this.jwtService.decode(token);
  }
}
