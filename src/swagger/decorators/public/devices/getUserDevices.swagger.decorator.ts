import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { SwaggerConstants } from '../../../swagger.constants';
import { DeviceViewModel } from '../../../../modules/public/devices/types/deviceViewModel';

export function GetUserDevicesSwaggerDecorator() {
  return applyDecorators(
    ApiOperation({
      summary: SwaggerConstants.getDevices,
    }),
    ApiResponse({
      status: 200,
      description: SwaggerConstants.success,
      isArray: true,
      type: DeviceViewModel,
    }),
    ApiUnauthorizedResponse({
      description: SwaggerConstants.unauthorized,
    }),
  );
}
