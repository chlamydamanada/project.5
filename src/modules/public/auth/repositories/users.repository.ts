import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UserToCheckCredentialsType } from '../types/userToCheckCredentialsType';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { BanList } from '../../../bloggers/domain/banStatus.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    @InjectRepository(BanList)
    private readonly banListRepository: Repository<BanList>,
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
    const userByLogin = await this.dataSource.query(
      `select * from "user" where "login" = $1`,
      [login],
    );
    if (userByLogin.length > 0) return { isExist: true, field: 'login' };
    //check is user exist by email
    const userByEmail = await this.dataSource.query(
      `select * from "user" where "email" = $1`,
      [email],
    );
    if (userByEmail.length > 0) return { isExist: true, field: 'email' };
    return { isExist: false, field: null };
  }

  async registerUser(
    login: string,
    email: string,
    passwordHash: string,
    expirationDate: Date,
  ): Promise<string> {
    //create user
    const userId = await this.dataSource.query(
      `
INSERT INTO public."user"("login", "email", "passwordHash")
VALUES ($1, $2, $3)
returning "user".id`,
      [login, email, passwordHash],
    );

    //create ban info
    await this.dataSource.query(
      `
INSERT INTO public."ban_info"("userId")
VALUES ( $1 )`,
      [userId[0].id],
    );

    //create email confirmation info: user created by super admin should be confirmed
    const code = await this.dataSource.query(
      `
INSERT INTO public."email_confirmation_info"("userId", "expirationDate")
VALUES ( $1, $2 )
returning "email_confirmation_info"."confirmationCode"`,
      [userId[0].id, expirationDate],
    );
    return code[0].confirmationCode;
  }

  async findUserByConfirmationCode(code: string): Promise<null | {
    userId: string;
    confirmationCode: string;
    expirationDate: string;
    isConfirmed: boolean;
  }> {
    const user = await this.dataSource.query(
      `SELECT * FROM public."email_confirmation_info" WHERE "confirmationCode" = $1`,
      [code],
    );
    if (user.length < 1) return null;
    return user[0];
  }

  async confirmEmail(userId: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE public."email_confirmation_info" SET "isConfirmed" = true WHERE "userId" = $1`,
      [userId],
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

  async findUserById(userId: string): Promise<User | null> {
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
