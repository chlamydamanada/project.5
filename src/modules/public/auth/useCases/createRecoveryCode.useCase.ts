import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repositories/users.repository';
import { MailService } from '../../../../adapters/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class CreateRecoveryCodeCommand {
  constructor(public email: string) {}
}
@CommandHandler(CreateRecoveryCodeCommand)
export class CreateRecoveryCodeUseCase
  implements ICommandHandler<CreateRecoveryCodeCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}
  async execute(command: CreateRecoveryCodeCommand): Promise<void> {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.email,
    );
    if (!user) return;

    // generate password recovery code
    const passwordRecoveryCode = uuidv4();

    //generate expiration date of password recovery code
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    await this.mailService.sendPasswordRecoveryEmail(
      passwordRecoveryCode,
      user.email,
    );

    //update password recovery code in db
    await this.usersRepository.updatePasswordRecoveryCode(
      user.id,
      passwordRecoveryCode,
      expirationDate,
    );
    return;
  }
}
