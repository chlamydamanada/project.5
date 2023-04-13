import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { CommentsViewModel } from '../../../../modules/public/comments/types/commentsViewModel';

export function GetAllCommentsByPostIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getComments,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: CommentsViewModel,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.postNotExist,
    }),
  );
}
