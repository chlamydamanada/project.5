import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { BlogsSAModel } from '../../../../modules/superAdmin/blogs/types/blogsSAModel';

export function GetBlogsBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBlogs,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: BlogsSAModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
