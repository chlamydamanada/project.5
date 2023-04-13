import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { EmailConfirmationInfo } from '../domain/emailConfirmationInfo.entity';
import { Device } from '../../../public/devices/domain/device.entity';
import { PasswordRecoveryInfo } from '../domain/passwordRecoveryInfo.entity';
import { BanInfo } from '../domain/banInfo.entity';

@Injectable()
export class UsersRepositoryToSA {
  constructor(
    @InjectRepository(PasswordRecoveryInfo)
    private readonly userRecoveryInfoRepository: Repository<PasswordRecoveryInfo>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(EmailConfirmationInfo)
    private readonly userConfirmationInfoRepository: Repository<EmailConfirmationInfo>,
    @InjectRepository(BanInfo)
    private readonly userBanInfoRepository: Repository<BanInfo>,
    @InjectRepository(Device)
    private readonly userDevicesRepository: Repository<Device>,
  ) {}
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

  async isUserExistById(userId: string): Promise<boolean> {
    const userById = await this.usersRepository.findOneBy({ id: userId });
    if (!userById) return false;
    return true;
  }

  async saveUser(user: User): Promise<string> {
    const newUser = await this.usersRepository.save(user);
    return newUser.id;
  }

  async saveEmailConfirmationInfo(
    confirmationInfo: EmailConfirmationInfo,
  ): Promise<void> {
    await this.userConfirmationInfoRepository.save(confirmationInfo);
    return;
  }

  async saveUserBanInfo(banInfo: BanInfo): Promise<void> {
    await this.userBanInfoRepository.save(banInfo);
    return;
  }

  async findUserBanInfo(userId: string): Promise<BanInfo | null> {
    return this.userBanInfoRepository.findOneBy({ userId: userId });
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async deleteUserBanInfo(userId: string): Promise<void> {
    await this.userBanInfoRepository.delete({ userId: userId });
    return;
  }

  async deleteUserConfirmationInfo(userId: string): Promise<void> {
    await this.userConfirmationInfoRepository.delete({ userId: userId });
    return;
  }

  async deleteUserDevices(userId: string): Promise<void> {
    await this.userDevicesRepository.delete({ ownerId: userId });
    return;
  }

  async deleteUserRecoveryInfo(userId: string): Promise<void> {
    await this.userRecoveryInfoRepository.delete({ userId: userId });
    return;
  }

  async deleteUserById(userId: string): Promise<void> {
    await this.usersRepository.delete({ id: userId });
    return;
  }
}
