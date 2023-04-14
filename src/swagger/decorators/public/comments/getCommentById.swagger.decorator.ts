import { applyDecorators } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { CommentViewModel } from '../../../../modules/public/comments/types/commentViewModel';

export function GetCommentByIdSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getComment,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: CommentViewModel,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.commentNotExist,
    }),
  );
}
