import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { MailService } from '../../../../adapters/email/email.service';
import { BcryptAdapter } from '../../../../adapters/bcrypt/bcryptAdapter';
import { BadRequestError } from '../../../../helpers/errorHelper/badRequestError';
import { add } from 'date-fns';
import { User } from '../../../superAdmin/users/domain/user.entity';
import { BanInfo } from '../../../superAdmin/users/domain/banInfo.entity';
import { EmailConfirmationInfo } from '../../../superAdmin/users/domain/emailConfirmationInfo.entity';

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

    //create and register user
    const newUser = new User();
    newUser.login = command.login;
    newUser.email = command.email;
    newUser.passwordHash = passwordHash;

    const userId = await this.usersRepository.saveUser(newUser);

    //create ban info
    const banInfo = new BanInfo();
    banInfo.userId = userId;
    await this.usersRepository.saveUserBanInfo(banInfo);

    //create email confirmation info
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    const confirmationInfo = new EmailConfirmationInfo();
    confirmationInfo.userId = userId;
    confirmationInfo.expirationDate = expirationDate;
    confirmationInfo.isConfirmed = false;

    const confirmationCode =
      await this.usersRepository.saveEmailConfirmationInfo(confirmationInfo);

    //send confirmation code to user email
    this.mailService.sendRegistrationEmail(confirmationCode, command.email);
    return;
  }
}
