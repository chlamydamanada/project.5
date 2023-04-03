import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}
@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: ConfirmEmailCommand): Promise<void> {
    // check if confirmation info not found, email is confirmed or confirmation code is expired
    const confirmationInfo =
      await this.usersRepository.findUserByConfirmationCode(command.code);
    if (!confirmationInfo)
      throw new BadRequestException([
        {
          message: 'The confirmation code is incorrect',
          field: 'code',
        },
      ]);

    if (confirmationInfo.isConfirmed)
      throw new BadRequestException([
        {
          message: 'email is confirmed',
          field: 'code',
        },
      ]);
    if (
      confirmationInfo.expirationDate.toISOString() < new Date().toISOString()
    )
      throw new BadRequestException([
        {
          message: 'The confirmation code is expired',
          field: 'code',
        },
      ]);

    // confirm user`s email
    confirmationInfo.isConfirmed = true;
    await this.usersRepository.confirmEmail(confirmationInfo.userId);
    return;
  }
}
