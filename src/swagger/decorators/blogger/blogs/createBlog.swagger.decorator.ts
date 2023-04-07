import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { blogCreateInputDto } from '../../../../modules/bloggers/api/pipes/blogs.pipes/blogCreateInput.dto';
import { BlogToBloggerViewModel } from '../../../../modules/bloggers/types/blogs/blogToBloggerViewModel';
import { ErrorsModel } from '../../../types/errorType';
import { SwaggerConstants } from '../../../swagger.constants';

export function CreateBlogSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.createBlog,
    }),
    ApiBody({ type: blogCreateInputDto }),
    ApiResponse({
      status: 201,
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
