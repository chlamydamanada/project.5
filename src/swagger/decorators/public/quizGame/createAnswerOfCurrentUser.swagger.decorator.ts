import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { AnswerViewModel } from '../../../../modules/public/quizGame/types/answerViewModel';
import { AnswerCreateInputDto } from '../../../../modules/public/quizGame/api/pipes/answerCreateInput.dto';

export function CreateAnswerOfCurrentUserSwaggerDecorator() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: SwaggerConstants.answer,
    }),
    ApiBody({
      type: AnswerCreateInputDto,
    }),
    ApiOkResponse({
      description: SwaggerConstants.answerOk,
      type: AnswerViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
    ApiForbiddenResponse({
      description: SwaggerConstants.answerForbidden,
    }),
  );
}
