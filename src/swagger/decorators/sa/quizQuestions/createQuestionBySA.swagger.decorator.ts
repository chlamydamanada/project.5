import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { QuestionViewModel } from '../../../../modules/superAdmin/quizQuestions/types/questionViewModel';
import { ErrorsModel } from '../../../types/errorType';
import { QuestionCreateInputDto } from '../../../../modules/superAdmin/quizQuestions/api/pipes/questionCreateInput.dto';

export function CreateQuestionBySASwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createQuestion,
    }),
    ApiBody({
      type: QuestionCreateInputDto,
    }),
    ApiCreatedResponse({
      description: SwaggerConstants.getCreatedQuestion,
      type: QuestionViewModel,
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
