import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function ConnectionToGameSwaggerDecorator() {
  return applyDecorators(ApiBearerAuth());
}
