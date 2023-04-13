import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { postViewModel } from '../../../../modules/public/posts/types/postViewModel';

export function GetPostByIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getPost,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: postViewModel,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
