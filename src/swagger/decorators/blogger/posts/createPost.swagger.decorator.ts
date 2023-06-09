import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { postCreateInputDto } from '../../../../modules/bloggers/posts/api/pipes/postCreateInput.dto';
import { ErrorsModel } from '../../../types/errorType';
import { postViewModel } from '../../../../modules/bloggers/posts/types/postViewModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function CreatePostSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createPost,
    }),
    ApiBody({ type: postCreateInputDto }),

    ApiCreatedResponse({
      description: SwaggerConstants.getCreatedPost,
      type: postViewModel,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiForbiddenResponse({
      description: SwaggerConstants.forbidden,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
