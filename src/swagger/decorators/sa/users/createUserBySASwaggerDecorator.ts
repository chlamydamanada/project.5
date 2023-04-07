import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { userCreateInputDto } from '../../../../modules/superAdmin/api/pipes/users.pipes/userCreateInput.dto';
import { SwaggerConstants } from '../../../swagger.constants';
import { ErrorsModel } from '../../../types/errorType';
import { UserViewModel } from '../../../../modules/superAdmin/types/users/userViewType';

export function CreateUserBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createUser,
    }),
    ApiBody({ type: userCreateInputDto }),
    ApiResponse({
      status: 201,
      description: SwaggerConstants.getCreatedUser,
      type: UserViewModel,
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
