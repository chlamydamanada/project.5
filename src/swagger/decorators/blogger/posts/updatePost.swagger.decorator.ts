import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { postUpdateInputDto } from '../../../../modules/bloggers/api/pipes/posts.pipes/postUpdateInput.dto';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function UpdatePostSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.updatePost,
    }),
    ApiBody({ type: postUpdateInputDto }),
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
    ApiForbiddenResponse({
      description: SwaggerConstants.forbidden,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
