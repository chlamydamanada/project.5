import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { postsViewModel } from '../../../../modules/public/posts/types/postsViewModel';

export function GetAllPostsByBlogIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getPosts,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: postsViewModel,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.blogNotExist,
    }),
  );
}
