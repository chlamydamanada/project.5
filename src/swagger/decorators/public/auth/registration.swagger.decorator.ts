import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { userCreateInputDto } from '../../../../modules/superAdmin/users/api/pipes/userCreateInput.dto';
import { ErrorsModel } from '../../../types/errorType';

export function RegistrationSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.registration,
    }),
    ApiBody({
      type: userCreateInputDto,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.registrationOk,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiTooManyRequestsResponse({
      description: SwaggerConstants.throttler,
    }),
  );
}
