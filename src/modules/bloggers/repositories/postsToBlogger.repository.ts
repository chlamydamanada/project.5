import { InjectRepository } from '@nestjs/typeorm';
import { Post } from '../domain/post.entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsToBloggerRepository {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {}

  async findPostById(postId: string): Promise<Post | null> {
    const post = await this.postsRepository.findOneBy({ id: postId });
    if (!post) return null;
    return post;
  }

  async savePost(post: Post): Promise<string> {
    const newPost = await this.postsRepository.save(post);
    return newPost.id;
  }

  async deletePost(postId: string): Promise<void> {
    // cascading delete post and all comments of this post
    await this.postsRepository.delete(postId);
    return;
  }
}
