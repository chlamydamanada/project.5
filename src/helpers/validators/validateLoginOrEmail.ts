import { BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { loginInputDto } from '../../modules/public/auth/api/pipes/loginInput.dto';

export const validateLoginOrEmail = async (
  loginOrEmail: string,
  password: string,
) => {
  const loginDto = new loginInputDto();
  loginDto.password = password;
  loginDto.loginOrEmail = loginOrEmail;
  const errors = await validate(loginDto);
  // if got some errors in [], should take it in correct form
  if (errors.length > 0)
    throw new BadRequestException(
      errors.map((e) => ({
        message: Object.values(e.constraints!)[0],
        field: e.property,
      })),
    );
  return;
};
