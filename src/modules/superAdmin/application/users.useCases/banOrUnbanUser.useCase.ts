import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';
import { DevicesRepository } from '../../../public/devices/repositories/device.repository';
import { DevicesRepositoryToSA } from '../../repositories/devicesToSA.repository';

export class BanOrUnbanUserCommand {
  constructor(
    public userId: string,
    public isBanned: boolean,
    public banReason: string,
  ) {}
}

@CommandHandler(BanOrUnbanUserCommand)
export class BanOrUnbanUserUseCase
  implements ICommandHandler<BanOrUnbanUserCommand>
{
  constructor(
    private readonly usersRepository: UsersRepositoryToSA,
    private readonly devicesRepository: DevicesRepositoryToSA,
  ) {}
  async execute(command: BanOrUnbanUserCommand): Promise<void> {
    const user = await this.usersRepository.isUserExistById(command.userId);
    if (!user) throw new NotFoundException('User with this id does not exist');
    //check ban or unban user
    if (command.isBanned) {
      // ban user
      await this.usersRepository.banUserBySA(command.userId, command.banReason);
      //all devices of user must be deleted, if user is banned
      await this.devicesRepository.deleteAllUserDevices(command.userId);
      return;
    }
    // unban user
    await this.usersRepository.unbanUserBySA(command.userId);
    return;
  }
}
