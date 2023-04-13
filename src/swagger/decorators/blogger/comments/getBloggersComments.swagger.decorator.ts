import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CommentsViewForBloggerModel } from '../../../../modules/bloggers/comments/types/commentsViewForBloggerModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function GetBloggersCommentsSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBloggersComments,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: CommentsViewForBloggerModel,
    }),
  );
}
