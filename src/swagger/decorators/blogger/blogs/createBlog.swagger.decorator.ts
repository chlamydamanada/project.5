import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { blogCreateInputDto } from '../../../../modules/bloggers/blogs/api/pipes/blogCreateInput.dto';
import { BlogToBloggerViewModel } from '../../../../modules/bloggers/blogs/types/blogToBloggerViewModel';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function CreateBlogSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createBlog,
    }),
    ApiBody({ type: blogCreateInputDto }),

    ApiCreatedResponse({
      description: SwaggerConstants.getCreatedBlog,
      type: BlogToBloggerViewModel,
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
