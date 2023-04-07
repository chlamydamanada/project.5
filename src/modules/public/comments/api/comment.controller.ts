import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ExtractUserIdFromAT } from '../../auth/guards/extractUserIdFromAT.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CommentsPublicQueryRepository } from './query.repositories/commentsPublicQuery.repository';
import { CurrentUserId } from '../../../../helpers/decorators/currentUserId.decorator';
import { AccessTokenGuard } from '../../auth/guards/accessTokenAuth.guard';
import { commentInputDtoPipe } from './pipes/commentInputDtoPipe';
import { UpdateCommentCommand } from '../useCases/updateComment.useCase';
import { DeleteCommentCommand } from '../useCases/deleteComment.useCase';
import { CurrentUserInfo } from '../../../../helpers/decorators/currentUserIdAndLogin';
import { UserInfoType } from '../../auth/types/userInfoType';
import { StatusPipe } from '../../likeStatus/pipes/statusPipe';
import { GenerateCommentLikeStatusCommand } from '../../likeStatus/useCases/generateCommentLikeStatus.useCase';
import { ApiTags } from '@nestjs/swagger';
import { CommentViewType } from '../types/commentViewType';

@ApiTags('Public Comments')
@Controller('comments')
export class CommentsPublicController {
  constructor(
    private readonly commentsQueryRepository: CommentsPublicQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  @UseGuards(ExtractUserIdFromAT)
  async getCommentByCommentId(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<CommentViewType> {
    const comment = await this.commentsQueryRepository.getCommentByCommentId(
      commentId,
      userId,
    );
    if (!comment)
      throw new NotFoundException('Comment with this id does not exist');
    return comment;
  }

  @Put(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  async updateCommentByCommentId(
    @Param('id') commentId: string,
    @Body() commentInputDto: commentInputDtoPipe,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.commandBus.execute<UpdateCommentCommand>(
      new UpdateCommentCommand(commentId, commentInputDto.content, userId),
    );
    return;
  }

  @Put(':id/like-status')
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  async updateCommentStatusById(
    @Param('id') commentId: string,
    @CurrentUserInfo() userInfo: UserInfoType,
    @Body() statusDto: StatusPipe,
  ): Promise<void> {
    await this.commandBus.execute<GenerateCommentLikeStatusCommand>(
      new GenerateCommentLikeStatusCommand(
        commentId,
        userInfo.id,
        statusDto.likeStatus,
      ),
    );
    return;
  }

  @Delete(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(204)
  async deleteCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    await this.commandBus.execute<DeleteCommentCommand>(
      new DeleteCommentCommand(commentId, userId),
    );
    return;
  }
}
