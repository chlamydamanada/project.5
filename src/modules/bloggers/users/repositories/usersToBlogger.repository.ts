import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BanList } from '../domain/banList.entity';
import { User } from '../../../superAdmin/users/domain/user.entity';

@Injectable()
export class UsersToBloggerRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(BanList)
    private readonly banRepository: Repository<BanList>,
  ) {}

  async findUserById(userId: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) return null;
    return user;
  }

  async findBanListOfBlog(
    blogId: string,
    userId: string,
  ): Promise<BanList | null> {
    const ban = await this.banRepository.findOneBy({
      blogId: blogId,
      userId: userId,
    });
    if (!ban) return null;
    return ban;
  }

  async banUserForBlog(ban: BanList): Promise<void> {
    await this.banRepository.save(ban);
    return;
  }

  async unbanUserForBlog(blogId: string, userId: string): Promise<void> {
    await this.banRepository.delete({ blogId: blogId, userId: userId });
    return;
  }
}
