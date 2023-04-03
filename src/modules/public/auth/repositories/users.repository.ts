import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserToCheckCredentialsType } from '../types/userToCheckCredentialsType';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { BanList } from '../../../bloggers/domain/banStatus.entity';
import { BanInfo } from '../../../superAdmin/domain/users.entities/banInfo.entity';
import { EmailConfirmationInfo } from '../../../superAdmin/domain/users.entities/emailConfirmationInfo.entity';
import { PasswordRecoveryInfo } from '../../../superAdmin/domain/users.entities/passwordRecoveryInfo.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
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
    const user = await this.dataSource.query(
      `
SELECT u.*, b."isBanned", b."banDate", b."banReason"
FROM public."user" u 
LEFT JOIN public."ban_info" b
ON b."userId" = u."id" 
WHERE "login" = $1 OR "email" = $1`,
      [loginOrEmail],
    );
    if (user.length < 1) return null;
    return user[0];
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

  async findUserByConfirmationCode(code: string): Promise<null | {
    userId: string;
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  }> {
    return await this.userEmailConfirmationInfoRepository.findOneBy({
      confirmationCode: code,
    });
  }

  async confirmEmail(userId: string): Promise<void> {
    await this.userEmailConfirmationInfoRepository.update(
      { userId: userId },
      { isConfirmed: true },
    );
    return;
  }

  async findUserAndConfirmationInfoByEmail(email: string): Promise<null | {
    id: string;
    login: string;
    email: string;
    isConfirmed: boolean;
  }> {
    const user = await this.dataSource.query(
      `SELECT u."id", u."login", u."email", e."isConfirmed"
FROM public."user" u LEFT JOIN "email_confirmation_info" e ON e."userId" = u."id"
WHERE u."email" = $1`,
      [email],
    );
    if (user.length < 1) return null;
    return user[0];
  }

  async updateEmailConfirmationCode(
    userId: string,
    newCode: string,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE public."email_confirmation_info" SET "confirmationCode" = $1 WHERE "userId" = $2`,
      [newCode, userId],
    );
    return;
  }

  async updatePasswordRecoveryCode(
    userId: string,
    code: string,
    expirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE public."password_recovery_info" 
SET "userId" = $1, "recoveryCode" = $2, "expirationDate" = $3 WHERE "userId" = $1`,
      [userId, code, expirationDate],
    );
    return;
  }

  async findUserByPasswordRecoveryCode(code: string): Promise<null | {
    id: string;
    login: string;
    email: string;
    expirationDate: string;
  }> {
    const user = await this.dataSource.query(
      `SELECT u."id", u."login", u."email", p."expirationDate"
FROM public."user" u LEFT JOIN public."password_recovery_info" p
ON p."userId" = u."id" WHERE p."recoveryCode" = $1`,
      [code],
    );
    if (user.length < 1) return null;
    return user[0];
  }

  async updatePasswordHash(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE public."user" SET "passwordHash" = $1 WHERE id = $2`,
      [passwordHash, userId],
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
