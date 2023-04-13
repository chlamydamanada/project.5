import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { UsersQueryRepositoryToSA } from './query.repositories/usersToSAQuery.repository';
import { DeleteUserBySASwaggerDecorator } from '../../../../swagger/decorators/sa/users/deleteUserBySA.swagger.decorator';
import { GetUsersBySASwaggerDecorator } from '../../../../swagger/decorators/sa/users/getUsersBySA.swagger.decorator';
import { BasicAuthGuard } from '../../../public/auth/guards/auth-guard';
import { UsersViewModel } from '../types/usersViewModel';
import { CreateUserBySASwaggerDecorator } from '../../../../swagger/decorators/sa/users/createUserBySASwaggerDecorator';
import { BanUserBySASwaggerDecorator } from '../../../../swagger/decorators/sa/users/banUserBySA.swagger.decorator';
import { userQueryType } from '../types/userQueryType';
import { CreateUserCommand } from '../useCases/createUser.useCase';
import { ApiBasicAuth, ApiTags } from '@nestjs/swagger';
import { userCreateInputDto } from './pipes/userCreateInput.dto';
import { UserViewModel } from '../types/userViewType';
import { DeleteUserCommand } from '../useCases/deleteUser.useCase';
import { BanOrUnbanUserCommand } from '../useCases/banOrUnbanUser.useCase';
import { UsersToSAQueryDto } from './pipes/usersToSAQuery.dto';
import { BanOrUnbanUserBySADto } from './pipes/banOrUnbanUserBySA.dto';

@ApiTags('Users')
@ApiBasicAuth()
@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class UsersToSAController {
  constructor(
    private readonly usersQueryRepository: UsersQueryRepositoryToSA,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @GetUsersBySASwaggerDecorator()
  async getAllUsers(
    @Query() query: UsersToSAQueryDto,
  ): Promise<UsersViewModel> {
    const users = await this.usersQueryRepository.getAllUsers(
      query as userQueryType,
    );
    return users;
  }

  @Post()
  @CreateUserBySASwaggerDecorator()
  async createUser(
    @Body() userInputModel: userCreateInputDto,
  ): Promise<UserViewModel> {
    const newUserId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(
        userInputModel.login,
        userInputModel.email,
        userInputModel.password,
      ),
    );
    const newUser = await this.usersQueryRepository.getUserByUserId(newUserId);
    return newUser!;
  }

  @Delete(':id')
  @DeleteUserBySASwaggerDecorator()
  @HttpCode(204)
  async deleteUserByUserId(@Param('id') userId: string): Promise<void> {
    await this.commandBus.execute<DeleteUserCommand>(
      new DeleteUserCommand(userId),
    );
    return;
  }

  @Put(':id/ban')
  @BanUserBySASwaggerDecorator()
  @HttpCode(204)
  async banOrUnbanUser(
    @Param('id') userId: string,
    @Body() banStatusInputModel: BanOrUnbanUserBySADto,
  ): Promise<void> {
    await this.commandBus.execute<BanOrUnbanUserCommand>(
      new BanOrUnbanUserCommand(
        userId,
        banStatusInputModel.isBanned,
        banStatusInputModel.banReason,
      ),
    );
    return;
  }
}
