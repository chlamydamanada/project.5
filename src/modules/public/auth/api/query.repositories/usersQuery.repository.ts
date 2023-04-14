import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeViewModel } from '../../types/meViewModel';
import { User } from '../../../../superAdmin/users/domain/user.entity';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async getMyProfile(userId: string): Promise<MeViewModel | null> {
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
