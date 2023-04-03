import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeViewType } from '../../types/meViewType';
import { User } from '../../../../superAdmin/domain/users.entities/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMyProfile(userId: string): Promise<MeViewType | null> {
    const user = await this.usersRepository.findOne({
      select: {
        id: true,
        login: true,
        email: true,
      },
      where: {
        id: userId,
      },
    });
    if (!user) return null;
    return {
      email: user.email,
      login: user.login,
      userId: user.id,
    };
  }
}
