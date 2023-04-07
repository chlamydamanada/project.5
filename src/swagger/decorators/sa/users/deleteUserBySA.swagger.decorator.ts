import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';

export function DeleteUserBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.deleteUserById,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
