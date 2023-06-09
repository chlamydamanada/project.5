import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { GameViewModel } from '../../../../modules/public/quizGame/types/gameViewModel';
import { SwaggerConstants } from '../../../swagger.constants';

export function ConnectionToGameSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.connection,
    }),
    ApiOkResponse({
      description: SwaggerConstants.connectionOk,
      type: GameViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiForbiddenResponse({
      description: SwaggerConstants.connectionForbidden,
    }),
  );
}
