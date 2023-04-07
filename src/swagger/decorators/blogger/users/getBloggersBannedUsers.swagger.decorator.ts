import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BannedUsersForBlogModel } from '../../../../modules/bloggers/types/users/bannedUsersForBlogModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function GetBloggersBannedUsersSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getBloggersBannedUsers,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: BannedUsersForBlogModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
