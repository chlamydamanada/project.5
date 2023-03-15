import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ExtractUserIdFromAT implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const auth = request.headers.authorization;
    if (!auth) {
      request.user = { id: null };
      return true;
    }
    const authType = auth.split(' ')[0];
    if (authType !== 'Bearer') {
      request.user = { id: null };
      return true;
    }
    const accessToken = auth.split(' ')[1];
    if (!accessToken) {
      request.user = { id: null };
      return true;
    }
    const payload: any = this.jwtService.decode(accessToken);
    if (!payload) {
      request.user = { id: null };
      return true;
    }
    request.user = { id: payload.userId };
    return true;
  }
}
