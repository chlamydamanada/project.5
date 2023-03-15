import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../repositories/device.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteDeviceCommand {
  constructor(public deviceId: string, public userId: string) {}
}
@CommandHandler(DeleteDeviceCommand)
export class DeleteDeviceUseCase
  implements ICommandHandler<DeleteDeviceCommand>
{
  constructor(private readonly devicesRepository: DevicesRepository) {}
  async execute(command: DeleteDeviceCommand): Promise<void> {
    const device = await this.devicesRepository.findDeviceByDeviceId(
      command.deviceId,
    );
    if (!device) throw new NotFoundException('device not found');
    if (command.userId !== device.ownerId)
      throw new ForbiddenException(
        'You try to delete the device of other user',
      );
    await this.devicesRepository.deleteDeviceByDeviceId(command.deviceId);
    return;
  }
}
