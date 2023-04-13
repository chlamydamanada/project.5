import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserToCheckCredentialsType } from '../types/userToCheckCredentialsType';
import { User } from '../../../superAdmin/users/domain/user.entity';
import { EmailConfirmationInfo } from '../../../superAdmin/users/domain/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from '../../../superAdmin/users/domain/passwordRecoveryInfo.entity';
import { BanList } from '../../../bloggers/users/domain/banList.entity';
import { BanInfo } from '../../../superAdmin/users/domain/banInfo.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(BanList)
    private readonly banListRepository: Repository<BanList>,
    @InjectRepository(BanInfo)
    private readonly userBanInfoRepository: Repository<BanInfo>,
    @InjectRepository(EmailConfirmationInfo)
    private readonly userEmailConfirmationInfoRepository: Repository<EmailConfirmationInfo>,
    @InjectRepository(PasswordRecoveryInfo)
    private readonly userRecoveryInfoRepository: Repository<PasswordRecoveryInfo>,
  ) {}

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<null | UserToCheckCredentialsType> {
    const user = await this.usersRepository.findOne({
      relations: {
        banInfo: true,
      },
      select: {
        id: true,
        login: true,
        email: true,
        passwordHash: true,
        banInfo: {
          isBanned: true,
        },
      },
      where: [{ login: loginOrEmail }, { email: loginOrEmail }], // Запрос с оператором OR
    });
    if (!user) return null;
    return user;
  }

  async isUserExistByLoginOrEmail(
    login: string,
    email: string,
  ): Promise<{ isExist: boolean; field: 'email' | 'login' | null }> {
    // check is user exist by login
    const userByLogin = await this.usersRepository.findOneBy({ login: login });
    if (userByLogin) return { isExist: true, field: 'login' };
    //check is user exist by email
    const userByEmail = await this.usersRepository.findOneBy({ email: email });
    if (userByEmail) return { isExist: true, field: 'email' };
    return { isExist: false, field: null };
  }

  async saveUser(user: User): Promise<string> {
    const newUser = await this.usersRepository.save(user);
    return newUser.id;
  }

  async saveUserBanInfo(ban: BanInfo): Promise<void> {
    await this.userBanInfoRepository.save(ban);
    return;
  }

  async saveEmailConfirmationInfo(
    info: EmailConfirmationInfo,
  ): Promise<string> {
    const emailInfo = await this.userEmailConfirmationInfoRepository.save(info);
    return emailInfo.confirmationCode;
  }

  async saveRecoveryInfo(info: PasswordRecoveryInfo): Promise<void> {
    await this.userRecoveryInfoRepository.save(info);
    return;
  }

  async findUserByConfirmationCode(
    code: string,
  ): Promise<null | EmailConfirmationInfo> {
    return await this.userEmailConfirmationInfoRepository.findOne({
      where: {
        confirmationCode: code,
      },
    });
  }

  async findUserAndConfirmationInfoByEmail(email: string): Promise<null | {
    id: string;
    emailConfirmationInfo: {
      isConfirmed: boolean;
    };
  }> {
    const user = await this.usersRepository.findOne({
      relations: {
        emailConfirmationInfo: true,
      },
      select: {
        id: true,
        emailConfirmationInfo: {
          isConfirmed: true,
        },
      },
      where: {
        email: email,
      },
    });
    if (!user) return null;
    return user;
  }

  async updateEmailConfirmationCode(
    userId: string,
    newCode: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.userEmailConfirmationInfoRepository.update(
      { userId: userId },
      { confirmationCode: newCode, expirationDate: expirationDate },
    );
    return;
  }

  async findUserPasswordRecoveryInfo(
    code: string,
  ): Promise<null | PasswordRecoveryInfo> {
    const recoveryInfo = await this.userRecoveryInfoRepository.findOneBy({
      recoveryCode: code,
    });
    return recoveryInfo;
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.usersRepository.update(
      { id: userId },
      { passwordHash: passwordHash },
    );
    return;
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; login: string } | null> {
    return this.usersRepository.findOne({
      select: {
        id: true,
        login: true,
      },
      where: {
        id: userId,
      },
    });
  }

  async checkUserIsBannedToBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const isBanned = await this.banListRepository.findOne({
      select: {
        isBanned: true,
      },
      where: {
        userId: userId,
        blogId: blogId,
      },
    });
    if (!isBanned) return false;
    return true;
  }
}
