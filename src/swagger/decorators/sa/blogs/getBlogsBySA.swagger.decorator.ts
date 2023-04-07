import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BlogsSAModel } from '../../../../modules/superAdmin/types/blogs/blogsSAModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function GetBlogsBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBlogs,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: BlogsSAModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
