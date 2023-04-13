import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';
import { BanUserByBloggerInputDto } from '../../../../modules/bloggers/users/api/pipes/banUserByBloggerInput.dto';

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
