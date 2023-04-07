import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';

export function DeleteDeviceByIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.deleteDeviceById,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiForbiddenResponse({
      description: SwaggerConstants.forbidden,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
