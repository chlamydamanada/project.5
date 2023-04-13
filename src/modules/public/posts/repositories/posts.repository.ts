import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../../bloggers/posts/domain/post.entity';
import { PostLikeStatus } from '../../likeStatus/domain/postLikeStatus.entity';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostLikeStatus)
    private readonly postsLikeStatusRepository: Repository<PostLikeStatus>,
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

  async findStatusOfPost(
    postId: string,
    userId: string,
  ): Promise<PostLikeStatus | null> {
    const status = await this.postsLikeStatusRepository.findOne({
      where: {
        postId: postId,
        userId: userId,
      },
    });
    return status;
  }

  async saveStatus(status: PostLikeStatus): Promise<void> {
    await this.postsLikeStatusRepository.save(status);
    return;
  }
}
