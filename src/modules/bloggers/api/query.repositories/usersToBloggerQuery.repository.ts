import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../superAdmin/domain/users.entities/user.entity';
import { ILike, Repository } from 'typeorm';
import { BanList } from '../../domain/banStatus.entity';
import { BannedUserQueryDtoType } from '../../types/users/bannedUserQueryDtoType';

@Injectable()
export class UsersToBloggerQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(BanList)
    private readonly banRepository: Repository<BanList>,
  ) {}

  async findBannedUsersForBlog(
    blogId: string,
    queryDto: BannedUserQueryDtoType,
  ) {
    const filter = this.makeBanListFilter(blogId, queryDto.searchLoginTerm);
    const banList = await this.banRepository.find({
      select: {
        userId: true,
        userLogin: true,
        isBanned: true,
        banDate: true,
        banReason: true,
      },
      where: filter,
      order: { [queryDto.sortBy]: queryDto.sortDirection },
      skip: (queryDto.pageNumber - 1) * queryDto.pageSize,
      take: queryDto.pageSize,
    });
    const totalCount = await this.banRepository.count({
      where: filter,
    });
    const result = banList.map((e) => ({
      id: e.userId,
      login: e.userLogin,
      banInfo: {
        isBanned: true,
        banDate: e.banDate,
        banReason: e.banReason,
      },
    }));
    return {
      pagesCount: Math.ceil(totalCount / queryDto.pageSize),
      page: queryDto.pageNumber,
      pageSize: queryDto.pageSize,
      totalCount: totalCount,
      items: result,
    };
  }

  makeBanListFilter(blogId: string, userLogin?: string | null) {
    if (userLogin)
      return { blogId: blogId, userLogin: ILike(`%${userLogin}%`) };
    return { blogId: blogId };
  }
}
