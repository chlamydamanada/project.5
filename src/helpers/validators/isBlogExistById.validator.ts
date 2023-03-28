/*import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsQueryRepository } from '../../modules/features/public/blogs/api/queryRepositories/blogs-query-repositories.service';

@ValidatorConstraint({ name: 'IsBlogExist', async: true })
@Injectable()
export class IsBlogExistValidator implements ValidatorConstraintInterface {
  constructor(private readonly blogsQweryRepository: BlogsQueryRepository) {}

  async validate(id: string) {
    const blog = await this.blogsQweryRepository.getBlogByBlogId(id);
    if (blog) return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return "Blog doesn't exist";
  }
}*/
