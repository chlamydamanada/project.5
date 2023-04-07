import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class NewPassRecoveryDtoPipe {
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  recoveryCode: string;
}
