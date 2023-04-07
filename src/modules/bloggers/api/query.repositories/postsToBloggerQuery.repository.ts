import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../../domain/post.entity';
import { Repository } from 'typeorm';
import { postViewModel } from '../../../public/posts/types/postViewModel';

@Injectable()
export class PostsToBloggerQueryRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}
  async getPostByPostId(postId: string): Promise<postViewModel | null> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) return null;
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  }
}
