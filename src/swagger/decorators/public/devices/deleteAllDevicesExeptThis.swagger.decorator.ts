import { applyDecorators } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';

export function DeleteAllDevicesExceptThisSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.deleteAllDevicesExceptThis,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
