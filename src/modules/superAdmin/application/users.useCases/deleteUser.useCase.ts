import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly usersRepository: UsersRepositoryToSA) {}
  async execute(command: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.isUserExistById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');

    await this.usersRepository.deleteUserById(command.userId);
    return;
  }
}
