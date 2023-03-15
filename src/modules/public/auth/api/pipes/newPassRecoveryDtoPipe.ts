import { IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';

export class NewPassRecoveryDtoPipe {
  @Length(6, 20)
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  recoveryCode: string;
}
