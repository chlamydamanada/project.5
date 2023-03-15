import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { BadRequestError } from '../../../../helpers/errorHelper/badRequestError';
import { BcryptAdapter } from '../../../../adapters/bcrypt/bcryptAdapter';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';

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
    const newUserId = this.usersRepository.createUser(
      command.login,
      command.email,
      passwordHash,
    );

    return newUserId;
  }
}
