import { applyDecorators } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';

export function DeleteBlogSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.deleteBlogById,
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
