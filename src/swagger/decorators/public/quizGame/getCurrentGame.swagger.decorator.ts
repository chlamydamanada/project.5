import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { GameViewModel } from '../../../../modules/public/quizGame/types/gameViewModel';

export function GetCurrentGameSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.getCurrentGame,
    }),
    ApiOkResponse({
      description: SwaggerConstants.getCurrentGameOk,
      type: GameViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
