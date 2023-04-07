import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BanOrUnbanBlogDto } from '../../../../modules/superAdmin/api/pipes/blogs.pipes/banOrUnbanBlog.dto';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function BanBlogBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.banBlog,
    }),
    ApiBody({ type: BanOrUnbanBlogDto }),

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
