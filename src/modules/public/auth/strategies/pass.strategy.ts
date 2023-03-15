import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { CommandBus } from '@nestjs/cqrs';
import { CheckCredentialsCommand } from '../useCases/checkCredentials.useCase';
import { validateLoginOrEmail } from '../../../../helpers/validators/validateLoginOrEmail';

@Injectable()
export class PasswordStrategy extends PassportStrategy(Strategy) {
  constructor(private commandBus: CommandBus) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<{ id: string } | any> {
    // validate input loginOrEmail and password
    await validateLoginOrEmail(loginOrEmail, password);
    //if input values are correct, check credentials
    const userInfo = await this.commandBus.execute(
      new CheckCredentialsCommand(loginOrEmail, password),
    );
    // if user isn`t found in db, should take error
    if (!userInfo) throw new UnauthorizedException();
    return userInfo;
  }
}
