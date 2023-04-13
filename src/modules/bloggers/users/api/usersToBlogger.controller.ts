import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersToBloggerQueryRepository } from './query.repositories/usersToBloggerQuery.repository';
import { AccessTokenGuard } from '../../../public/auth/guards/accessTokenAuth.guard';
import { BannedUsersForBlogModel } from '../types/bannedUsersForBlogModel';
import { BlogsToBloggerQueryRepository } from '../../blogs/api/query.repositories/blogsToBloggerQuery.repository';
import { BanOrUnbanUserByBloggerCommand } from '../useCases/banOrUnbanUserByBlogger.useCase';
import { BanUserByBloggerSwaggerDecorator } from '../../../../swagger/decorators/blogger/users/banUserByBlogger.swagger.decorator';
import { BanUserByBloggerInputDto } from './pipes/banUserByBloggerInput.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BannedUserToBloggerQueryDto } from './pipes/bannedUserToBloggerQuery.dto';
import { BannedUserQueryDtoType } from '../types/bannedUserQueryDtoType';
import { GetBloggersBannedUsersSwaggerDecorator } from '../../../../swagger/decorators/blogger/users/getBloggersBannedUsers.swagger.decorator';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { CommandBus } from '@nestjs/cqrs';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
@Controller('blogger/users')
export class UsersToBloggerController {
  constructor(
    private readonly bloggerQueryRepository: UsersToBloggerQueryRepository,
    private readonly blogsQueryRepository: BlogsToBloggerQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Put(':userId/ban')
  @BanUserByBloggerSwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('userId') userId: string,
    @CurrentUserId() bloggerId: string,
    @Body() banUserInputDto: BanUserByBloggerInputDto,
  ): Promise<void> {
    await this.commandBus.execute<BanOrUnbanUserByBloggerCommand>(
      new BanOrUnbanUserByBloggerCommand(
        userId,
        bloggerId,
        banUserInputDto.isBanned,
        banUserInputDto.banReason,
        banUserInputDto.blogId,
      ),
    );
    return;
  }

  @Get('blog/:blogId')
  @GetBloggersBannedUsersSwaggerDecorator()
  async getBannedUsersForBlog(
    @Param('blogId') blogId: string,
    @Query() query: BannedUserToBloggerQueryDto,
    @CurrentUserId() bloggerId: string,
  ): Promise<BannedUsersForBlogModel> {
    //check is blogger owner of this blog
    const blog = await this.blogsQueryRepository.getOwnerIdOfBlog(blogId);
    if (!blog)
      throw new NotFoundException('The blog with this id doesn`t exist');
    if (bloggerId !== blog?.bloggerId)
      throw new ForbiddenException('You aren`t owner of this blog');
    //find banned users for this blog
    const bannedUsers =
      await this.bloggerQueryRepository.findBannedUsersForBlog(
        blogId,
        query as BannedUserQueryDtoType,
      );
    if (!bannedUsers)
      throw new NotFoundException('You haven`t any banned users');
    return bannedUsers;
  }
}
