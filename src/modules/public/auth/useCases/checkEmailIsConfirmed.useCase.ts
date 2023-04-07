import { EmailType } from '../types/emailType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { MailService } from '../../../../adapters/email/email.service';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

export class CheckEmailIsConfirmedCommand {
  constructor(public email: string) {}
}
@CommandHandler(CheckEmailIsConfirmedCommand)
export class CheckEmailIsConfirmedUseCase
  implements ICommandHandler<CheckEmailIsConfirmedCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}
  async execute(command: CheckEmailIsConfirmedCommand): Promise<void> {
    const user = await this.usersRepository.findUserAndConfirmationInfoByEmail(
      command.email,
    );
    if (!user) {
      throw new BadRequestException([
        {
          message: 'User not found',
          field: 'email',
        },
      ]);
    }
    if (user.emailConfirmationInfo.isConfirmed) {
      throw new BadRequestException([
        {
          message: 'email already is confirmed',
          field: 'email',
        },
      ]);
    }
    // generate new confirmation code, expiration Date and save it
    const newCode = uuidv4();
    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 30,
    });
    await this.usersRepository.updateEmailConfirmationCode(
      user.id,
      newCode,
      expirationDate,
    );

    // send email with new confirmation code to user
    await this.mailService.sendRegistrationEmail(newCode, command.email);

    return;
  }
}
