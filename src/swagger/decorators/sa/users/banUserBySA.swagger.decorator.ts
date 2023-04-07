import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNoContentResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { BanOrUnbanUserBySADto } from '../../../../modules/superAdmin/api/pipes/users.pipes/banOrUnbanUserBySA.dto';
import { SwaggerConstants } from '../../../swagger.constants';
import { ErrorsModel } from '../../../types/errorType';

export function BanUserBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.banUser,
    }),
    ApiBody({ type: BanOrUnbanUserBySADto }),
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
