import { applyDecorators } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { QuestionsViewModel } from '../../../../modules/superAdmin/quizQuestions/types/questionsViewModel';

export function GetQuestionsBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getAllQuestions,
    }),
    ApiOkResponse({
      description: SwaggerConstants.success,
      type: QuestionsViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
