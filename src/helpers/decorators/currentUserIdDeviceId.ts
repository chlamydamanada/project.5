import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUserInfoAndDeviceId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.user;
  },
);
