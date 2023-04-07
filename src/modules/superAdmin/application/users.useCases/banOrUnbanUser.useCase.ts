import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UsersRepositoryToSA } from '../../repositories/usersToSA.repository';
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
    const banInfo = await this.usersRepository.findUserBanInfo(command.userId);
    if (!banInfo)
      throw new NotFoundException('User with this id does not exist');
    //check ban or unban user
    if (command.isBanned) {
      // ban user and save ban info
      banInfo.isBanned = true;
      banInfo.banDate = new Date().toISOString();
      banInfo.banReason = command.banReason;

      await this.usersRepository.saveUserBanInfo(banInfo);

      //all devices of user must be deleted, if user is banned
      await this.devicesRepository.deleteAllUserDevices(command.userId);
      return;
    }
    // unban user
    banInfo.isBanned = false;
    banInfo.banDate = null;
    banInfo.banReason = null;

    await this.usersRepository.saveUserBanInfo(banInfo);
    return;
  }
}
