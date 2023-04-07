import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BanUserByBloggerInputDto } from '../../../../modules/bloggers/api/pipes/users.pipes/banUserByBloggerInput.dto';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function BanUserByBloggerSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.banUser,
    }),
    ApiBody({ type: BanUserByBloggerInputDto }),
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
  );
}
