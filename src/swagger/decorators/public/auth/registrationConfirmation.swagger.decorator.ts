import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { CodeInputDto } from '../../../../modules/public/auth/api/pipes/codeInput.dto';
import { ErrorsModel } from '../../../types/errorType';

export function RegistrationConfirmationSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.confirm,
    }),
    ApiBody({
      type: CodeInputDto,
    }),
    ApiNoContentResponse({
      description: SwaggerConstants.confirmOk,
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
