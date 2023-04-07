import { ApiProperty } from '@nestjs/swagger';
class ErrorModel {
  @ApiProperty()
  message: string;
  @ApiProperty()
  field: string;
}
export class ErrorsModel {
  @ApiProperty({ isArray: true, type: ErrorModel })
  errorsMessages: ErrorModel[];
}
