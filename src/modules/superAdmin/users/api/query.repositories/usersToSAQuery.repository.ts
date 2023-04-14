import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { User } from '../../domain/user.entity';
import { UserViewModel } from '../../types/userViewModel';
import { userQueryType } from '../../types/userQueryType';
import { BanStatusType } from '../../types/banStatusType';

@Injectable()
export class UsersQueryRepositoryToSA {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async getAllUsers(queryDto: userQueryType) {
    // create filter
    const filter = this.createFilterByLoginOrEmail(
      queryDto.searchLoginTerm,
      queryDto.searchEmailTerm,
      queryDto.banStatus,
    );
    const allUsers = await this.usersRepository.find({
      relations: {
        banInfo: true,
      },
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
        banInfo: {
          isBanned: true,
          banDate: true,
          banReason: true,
        },
      },
      where: filter,
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });

    const totalCount = await this.usersRepository.count({
      where: filter,
    });

    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: allUsers,
    };
  }

  async getUserByUserId(userId: string): Promise<UserViewModel | null> {
    // find user by id with ban info
    const user = await this.usersRepository.findOne({
      relations: {
        banInfo: true,
      },
      select: {
        id: true,
        login: true,
        email: true,
        createdAt: true,
        banInfo: {
          isBanned: true,
          banDate: true,
          banReason: true,
        },
      },
      where: {
        id: userId,
      },
    });
    return user;
  }

  createFilterByLoginOrEmail(
    login: string | undefined,
    email: string | undefined,
    banStatus: BanStatusType,
  ) {
    // make filter by ban status
    const banFilter = this.createBanStatusFilter(banStatus);
    if (login && email) {
      return [
        { ...banFilter, login: ILike(`%${login}%`) },
        { ...banFilter, email: ILike(`%${email}%`) },
      ];
    }
    if (login) {
      return { ...banFilter, login: ILike(`%${login}%`) };
    }
    if (email) {
      return { ...banFilter, email: ILike(`%${email}%`) };
    }
    return banFilter;
  }

  createBanStatusFilter = (banStatus: BanStatusType) => {
    // make filter by ban status
    switch (banStatus) {
      case BanStatusType.banned:
        return {
          banInfo: {
            isBanned: true,
          },
        };
      case BanStatusType.notBanned:
        return {
          banInfo: {
            isBanned: false,
          },
        };

      default:
        return {};
    }
  };
}
