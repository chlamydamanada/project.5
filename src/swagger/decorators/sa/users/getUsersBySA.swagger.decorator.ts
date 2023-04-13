import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { UsersViewModel } from '../../../../modules/superAdmin/users/types/usersViewModel';

export function GetUsersBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getUsers,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      type: UsersViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
