import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BlogsToBloggerViewModel } from '../../../../modules/bloggers/blogs/types/blogsToBloggerViewModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function GetBloggersBlogsSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBloggersBlogs,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: BlogsToBloggerViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
