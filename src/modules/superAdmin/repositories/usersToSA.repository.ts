import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersRepositoryToSA {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
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

  async isUserExistById(userId: string): Promise<boolean> {
    const userById = await this.dataSource.query(
      `SELECT * FROM "user" WHERE "id" = $1`,
      [userId],
    );
    return userById.length > 0;
  }

  async createUser(
    login: string,
    email: string,
    passwordHash: string,
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
    await this.dataSource.query(
      `
INSERT INTO public."email_confirmation_info"("userId", "isConfirmed")
VALUES ( $1, true )`,
      [userId[0].id],
    );
    return userId[0].id;
  }

  async deleteUserById(userId: string): Promise<void> {
    await Promise.all([
      this.dataSource.query(
        `DELETE FROM public."device" WHERE "ownerId" = $1`,
        [userId],
      ),
      this.dataSource.query(
        `DELETE FROM public."ban_info" WHERE "userId" = $1`,
        [userId],
      ),
      this.dataSource.query(
        `DELETE FROM public."email_confirmation_info" WHERE "userId" = $1`,
        [userId],
      ),
      this.dataSource.query(
        `DELETE FROM public."password_recovery_info" WHERE "userId" = $1`,
        [userId],
      ),
      this.dataSource.query(`DELETE FROM public."user" WHERE "id" = $1`, [
        userId,
      ]),
    ]);
    return;
  }

  async banUserBySA(userId: string, banReason: string): Promise<void> {
    await this.dataSource.query(
      ` UPDATE public."ban_info"
SET  "isBanned" = true, "banDate" = $1, "banReason" = $2
WHERE "userId" = $3`,
      [new Date().toISOString(), banReason, userId],
    );
    return;
  }

  async unbanUserBySA(userId: string): Promise<void> {
    await this.dataSource.query(
      ` UPDATE public."ban_info"
SET  "isBanned" = false, "banDate" = null, "banReason" = null  
WHERE "userId" = $1`,
      [userId],
    );
    return;
  }
}
