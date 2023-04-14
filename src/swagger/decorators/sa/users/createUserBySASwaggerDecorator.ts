import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { ErrorsModel } from '../../../types/errorType';
import { userCreateInputDto } from '../../../../modules/superAdmin/users/api/pipes/userCreateInput.dto';
import { UserViewModel } from '../../../../modules/superAdmin/users/types/userViewModel';

export function CreateUserBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createUser,
    }),
    ApiBody({ type: userCreateInputDto }),
    ApiCreatedResponse({
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
