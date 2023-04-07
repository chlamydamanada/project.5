import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BadRequestError } from '../../../../helpers/errorHelper/badRequestError';
import { BcryptAdapter } from '../../../../adapters/bcrypt/bcryptAdapter';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';
import { User } from '../../domain/users.entities/user.entity';
import { BanInfo } from '../../domain/users.entities/banInfo.entity';
import { add } from 'date-fns';
import { EmailConfirmationInfo } from '../../domain/users.entities/emailConfirmationInfo.entity';

export class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepositoryToSA,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: CreateUserCommand): Promise<string> {
    // check exist user by login or email
    const isUserExist = await this.usersRepository.isUserExistByLoginOrEmail(
      command.login,
      command.email,
    );
    // one user can`t be created twice
    if (isUserExist.isExist)
      throw new BadRequestException([new BadRequestError(isUserExist.field)]);
    //generate hash
    const passwordHash = await this.bcryptAdapter.generatePasswordHash(
      command.password,
    );
    //create user entity
    const newUser = new User();
    newUser.login = command.login;
    newUser.email = command.email;
    newUser.passwordHash = passwordHash;

    const newUserId = await this.usersRepository.saveUser(newUser);

    //create ban info
    const banInfo = new BanInfo();
    banInfo.userId = newUserId;
    await this.usersRepository.saveUserBanInfo(banInfo);

    //create email confirmation info
    const confirmationInfo = new EmailConfirmationInfo();
    confirmationInfo.userId = newUserId;
    confirmationInfo.isConfirmed = true;
    await this.usersRepository.saveEmailConfirmationInfo(confirmationInfo);

    return newUserId;
  }
}
