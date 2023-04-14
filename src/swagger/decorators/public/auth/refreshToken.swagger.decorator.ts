import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { AccessTokenViewModel } from '../../../../modules/public/auth/types/accessTokenViewModel';

export function RefreshTokenSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.rT,
    }),
    ApiOkResponse({
      description: SwaggerConstants.jwtOk,
      type: AccessTokenViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
