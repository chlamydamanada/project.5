import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { blogViewModel } from '../../../../modules/public/blogs/types/blogViewModel';

export function GetBlogByIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBlog,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: blogViewModel,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
