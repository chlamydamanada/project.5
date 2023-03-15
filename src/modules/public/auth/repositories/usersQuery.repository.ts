import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { MeViewType } from '../types/meViewType';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getMyProfile(userId: string): Promise<MeViewType | null> {
    const user = await this.dataSource.query(
      `SELECT "id" as "userId", "login", "email" FROM public."user" WHERE "id" = $1`,
      [userId],
    );
    if (user.length < 1) return null;
    return user[0];
  }
}
