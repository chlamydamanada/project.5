import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../bloggers/domain/post.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}
  async checkPostExists(
    postId: string,
  ): Promise<{ id: string; blogId: string } | null> {
    return await this.postsRepository.findOne({
      select: {
        id: true,
        blogId: true,
      },
      where: {
        id: postId,
      },
    });
  }
}
