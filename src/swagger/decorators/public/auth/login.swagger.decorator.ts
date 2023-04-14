import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { loginInputDto } from '../../../../modules/public/auth/api/pipes/loginInput.dto';
import { ErrorsModel } from '../../../types/errorType';
import { AccessTokenViewModel } from '../../../../modules/public/auth/types/accessTokenViewModel';

export function LoginSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.login,
    }),
    ApiBody({
      type: loginInputDto,
    }),
    ApiOkResponse({
      description: SwaggerConstants.jwtOk,
      type: AccessTokenViewModel,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiTooManyRequestsResponse({
      description: SwaggerConstants.throttler,
    }),
  );
}
