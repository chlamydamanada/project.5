import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { postsViewModel } from '../../../../modules/public/posts/types/postsViewModel';

export function GetAllPostsSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getPosts,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: postsViewModel,
    }),
  );
}
