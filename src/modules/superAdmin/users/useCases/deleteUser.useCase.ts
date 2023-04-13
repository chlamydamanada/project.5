import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepositoryToSA } from '../repositories/usersToSA.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepositoryToSA) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    //check does user exist
    const user = await this.usersRepository.isUserExistById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');

    //delete user ban info and confirmation info
    await Promise.all([
      this.usersRepository.deleteUserBanInfo(command.userId),
      this.usersRepository.deleteUserConfirmationInfo(command.userId),
      this.usersRepository.deleteUserDevices(command.userId),
      this.usersRepository.deleteUserRecoveryInfo(command.userId),
    ]);

    // delete user by id
    await this.usersRepository.deleteUserById(command.userId);
    return;
  }
}
