import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';

export function LogoutSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.logout,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
