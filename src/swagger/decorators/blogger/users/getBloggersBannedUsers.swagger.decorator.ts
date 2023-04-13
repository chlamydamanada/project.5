import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BannedUsersForBlogModel } from '../../../../modules/bloggers/users/types/bannedUsersForBlogModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function GetBloggersBannedUsersSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBloggersBannedUsers,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: BannedUsersForBlogModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
