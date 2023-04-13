import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { commentCreateInputDto } from '../../../../modules/public/comments/api/pipes/commentCreateInput.dto';
import { CommentViewModel } from '../../../../modules/public/comments/types/commentViewModel';
import { ErrorsModel } from '../../../types/errorType';

export function CreateCommentByPostIdSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.createComment,
    }),
    ApiBody({
      type: commentCreateInputDto,
    }),
    ApiCreatedResponse({
      description: SwaggerConstants.getCreatedComment,
      type: CommentViewModel,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.postNotExist,
    }),
  );
}
