import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function BlogBindToUserSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.bindBlogToUser,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
