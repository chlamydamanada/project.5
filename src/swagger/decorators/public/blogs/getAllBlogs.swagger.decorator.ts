import { applyDecorators } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { blogsViewModel } from '../../../../modules/public/blogs/types/blogsViewModel';

export function GetAllBlogsSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBlogs,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: blogsViewModel,
    }),
  );
}
