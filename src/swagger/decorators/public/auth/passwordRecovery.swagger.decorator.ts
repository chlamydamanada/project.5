import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { EmailInputDto } from '../../../../modules/public/auth/api/pipes/emailInput.dto';
import { SwaggerConstants } from '../../../swagger.constants';
import { ErrorsModel } from '../../../types/errorType';

export function PasswordRecoverySwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.passRecovery,
    }),
    ApiBody({
      type: EmailInputDto,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.passRecoveryOk,
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
