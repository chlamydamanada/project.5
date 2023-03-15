import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { MailService } from '../../../../adapters/email/email.service';
import { BcryptAdapter } from '../../../../adapters/bcrypt/bcryptAdapter';
import { BadRequestError } from '../../../../helpers/errorHelper/badRequestError';
import { add } from 'date-fns';

export class UserRegistrationCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}
@CommandHandler(UserRegistrationCommand)
export class UserRegistrationUseCase
  implements ICommandHandler<UserRegistrationCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: UserRegistrationCommand): Promise<void> {
    // check exist user by login or email
    const isUserExist = await this.usersRepository.isUserExistByLoginOrEmail(
      command.login,
      command.email,
    );
    // one user can`t be registered twice
    if (isUserExist.isExist)
      throw new BadRequestException([new BadRequestError(isUserExist.field)]);
    //generate hash
    const passwordHash = await this.bcryptAdapter.generatePasswordHash(
      command.password,
    );

    // generate expiration date to confirmation code
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });

    //register user
    const confirmationCode = await this.usersRepository.registerUser(
      command.login,
      command.email,
      passwordHash,
      expirationDate,
    );

    //send confirmation code to user email
    await this.mailService.sendRegistrationEmail(
      confirmationCode,
      command.email,
    );
    return;
  }
}
