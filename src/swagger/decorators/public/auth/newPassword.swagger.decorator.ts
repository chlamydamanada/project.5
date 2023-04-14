import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { NewPassRecoveryDto } from '../../../../modules/public/auth/api/pipes/newPassRecovery.dto';
import { ErrorsModel } from '../../../types/errorType';

export function NewPasswordSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.newPass,
    }),
    ApiBody({
      type: NewPassRecoveryDto,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.newPassOk,
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
