import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { LikeStatusDto } from '../../../../modules/public/likeStatus/pipes/likeStatus.dto';
import { ErrorsModel } from '../../../types/errorType';

export function UpdateLikeStatusOfCommentSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.likeStatus,
    }),
    ApiBody({
      type: LikeStatusDto,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.noContent,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.commentNotExist,
    }),
  );
}
