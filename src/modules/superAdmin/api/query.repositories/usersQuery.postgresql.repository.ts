import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserViewType } from '../../types/userViewType';
import { userQueryType } from '../../types/userQueryType';
import { BanStatusType } from '../../types/banStatusType';

@Injectable()
export class UsersQueryRepositoryToSA {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllUsers(queryDto: userQueryType) {
    // create filter
    const filter = this.createFilterByLoginOrEmail(
      queryDto.searchLoginTerm,
      queryDto.searchEmailTerm,
      queryDto.banStatus,
    );
    const allUsers = await this.dataSource.query(
      `
SELECT u."id", u."login", u."email", u."createdAt", 
       b."isBanned", b."banDate", b."banReason"
FROM public."user" u
LEFT JOIN public."ban_info" b
ON b."userId" = u."id" 
WHERE ${filter}
ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
LIMIT $1  OFFSET (($2 - 1)*$1)`,
      [queryDto.pageSize, queryDto.pageNumber],
    );
    const totalCount = await this.dataSource.query(
      `SELECT COUNT(*) FROM public."user" u
LEFT JOIN public."ban_info" b ON b."userId" = u."id" 
WHERE ${filter}`,
    );
    const result = allUsers.map((u) => ({
      id: u.id,
      login: u.login,
      email: u.email,
      createdAt: u.createdAt,
      banInfo: {
        isBanned: u.isBanned,
        banDate: u.banDate,
        banReason: u.banReason,
      },
    }));
    return {
      pagesCount: Math.ceil(Number(totalCount[0].count) / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: Number(totalCount[0].count),
      items: result,
    };
  }

  async getUserByUserId(userId: string): Promise<UserViewType | null> {
    // find user by id with ban info
    const user = await this.dataSource.query(
      `
SELECT u."id", u."login", u."email", u."createdAt", 
       b."isBanned", b."banDate", b."banReason"
FROM public."user" u 
LEFT JOIN public."ban_info" b
ON b."userId" = u."id"
WHERE u."id" = $1`,
      [userId],
    );
    // if user not found
    if (user.length < 0) return null;
    // make view user form
    const result = user.map((u) => ({
      id: u.id,
      login: u.login,
      email: u.email,
      createdAt: u.createdAt,
      banInfo: {
        isBanned: u.isBanned,
        banDate: u.banDate,
        banReason: u.banReason,
      },
    }));
    return result[0];
  }

  createFilterByLoginOrEmail(
    login: string | undefined,
    email: string | undefined,
    banStatus: BanStatusType,
  ) {
    // make filter by ban status
    const banFilter = this.createBanStatusFilter(banStatus);
    if (login && email) {
      return (
        `LOWER(u."login") like LOWER('%${login}%')
or LOWER(u."email") like LOWER('%${email}%') and ` + banFilter
      );
    }
    if (login) {
      return `LOWER(u."login") like LOWER('%${login}%') and ` + banFilter;
    }
    if (email) {
      return `LOWER(u."email") like LOWER('%${email}%') and ` + banFilter;
    }
    return banFilter;
  }

  createBanStatusFilter = (banStatus: BanStatusType) => {
    // make filter by ban status
    switch (banStatus) {
      case BanStatusType.banned:
        return `b."isBanned" = true`;
      case BanStatusType.notBanned:
        return `b."isBanned" = false`;

      default:
        return `b."isBanned" = false or b."isBanned" = true`;
    }
  };
}
