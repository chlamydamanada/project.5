import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsModel } from '../../../types/errorType';
import { blogUpdateInputDto } from '../../../../modules/bloggers/blogs/api/pipes/blogUpdateInput.dto';
import { SwaggerConstants } from '../../../swagger.constants';

export function UpdateBlogSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.updateBlogById,
    }),
    ApiBody({ type: blogUpdateInputDto }),

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

    ApiForbiddenResponse({
      description: SwaggerConstants.forbidden,
    }),
  );
}
