import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../repositories/device.repository';

export class DeleteAllDevicesExceptThisCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(DeleteAllDevicesExceptThisCommand)
export class DeleteAllDevicesExceptThisUseCase
  implements ICommandHandler<DeleteAllDevicesExceptThisCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}
  async execute(command: DeleteAllDevicesExceptThisCommand) {
    await this.devicesRepository.deleteAllDevicesByIdExceptThis(
      command.userId,
      command.deviceId,
    );
    return;
  }
}
