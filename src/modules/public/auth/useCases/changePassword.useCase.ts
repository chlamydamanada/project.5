import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { BcryptAdapter } from '../../../../adapters/bcrypt/bcryptAdapter';

export class ChangePasswordCommand {
  constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly bcryptAdapter: BcryptAdapter,
  ) {}
  async execute(command: ChangePasswordCommand): Promise<void> {
    //find password recovery info
    const user = await this.usersRepository.findUserByPasswordRecoveryCode(
      command.recoveryCode,
    );
    if (!user) throw new Error('Incorrect recovery code');
    //check is recovery code expired
    if (user.expirationDate < new Date().toISOString())
      throw new BadRequestException([
        { message: 'Recovery code is expired', field: 'recoveryCode' },
      ]);
    //generate new password hash
    const passwordHash = await this.bcryptAdapter.generatePasswordHash(
      command.newPassword,
    );
    //update password hash
    await this.usersRepository.updatePasswordHash(user.id, passwordHash);
    return;
  }
}
