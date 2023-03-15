import { EmailType } from '../types/emailType';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersRepository } from '../repositories/users.repository';
import { MailService } from '../../../../adapters/email/email.service';
import { v4 as uuidv4 } from 'uuid';

export class CheckEmailIsConfirmedCommand {
  constructor(public emailDto: EmailType) {}
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
      command.emailDto.email,
    );
    if (!user) {
      throw new BadRequestException([
        {
          message: 'User not found',
          field: 'email',
        },
      ]);
    }
    if (user.isConfirmed) {
      throw new BadRequestException([
        {
          message: 'email already is confirmed',
          field: 'email',
        },
      ]);
    }
    // generate new confirmation code
    const newCode = uuidv4();
    // send email with new confirmation code to user
    await this.mailService.sendRegistrationEmail(newCode, user.email);

    //update confirmation code
    await this.usersRepository.updateEmailConfirmationCode(user.id, newCode);
    return;
  }
}
