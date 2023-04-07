import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
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
    const recoveryInfo =
      await this.usersRepository.findUserPasswordRecoveryInfo(
        command.recoveryCode,
      );
    if (!recoveryInfo)
      throw new BadRequestException([
        { message: 'Incorrect recovery code', field: 'recoveryCode' },
      ]);

    //check is recovery code expired
    if (recoveryInfo.expirationDate.toISOString() < new Date().toISOString())
      throw new BadRequestException([
        { message: 'Recovery code is expired', field: 'recoveryCode' },
      ]);
    //generate new password hash
    const passwordHash = await this.bcryptAdapter.generatePasswordHash(
      command.newPassword,
    );
    //update password hash
    await this.usersRepository.updatePasswordHash(
      recoveryInfo.userId,
      passwordHash,
    );
    return;
  }
}
