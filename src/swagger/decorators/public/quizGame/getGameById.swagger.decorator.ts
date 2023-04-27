import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { GameViewModel } from '../../../../modules/public/quizGame/types/gameViewModel';
import { ErrorsModel } from '../../../types/errorType';

export function GetGameByIdSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.gameById,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: GameViewModel,
    }),
    ApiBadRequestResponse({
      description: SwaggerConstants.badReq,
      type: ErrorsModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiForbiddenResponse({
      description: SwaggerConstants.gameByIdForbidden,
    }),
    ApiNotFoundResponse({
      description: SwaggerConstants.notFound,
    }),
  );
}
