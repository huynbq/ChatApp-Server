import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser as CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/types/current-user';
import { AddChatMemberDto } from './dto/add-chat-member.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { ChatsService } from './chats.service';

@UseGuards(AuthGuard)
@Controller('chats')
export class ChatsController {
  constructor(private readonly chats: ChatsService) {}

  @Get()
  list(@CurrentUserDecorator() user: CurrentUser) {
    return this.chats.list(user.id);
  }

  @Get(':chatId')
  get(@CurrentUserDecorator() user: CurrentUser, @Param('chatId') chatId: string) {
    return this.chats.get(chatId, user.id);
  }

  @Post(':chatId/read')
  markRead(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
  ) {
    return this.chats.markRead(chatId, user.id);
  }

  @Post('direct')
  createDirect(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateDirectChatDto,
  ) {
    return this.chats.createDirect(user.id, dto);
  }

  @Post('group')
  createGroup(
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: CreateGroupChatDto,
  ) {
    return this.chats.createGroup(user.id, dto);
  }

  @Post(':chatId/members')
  addMember(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
    @Body() dto: AddChatMemberDto,
  ) {
    return this.chats.addMember(chatId, user.id, dto.userId);
  }

  @Delete(':chatId/members/:userId')
  removeMember(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
    @Param('userId') userId: string,
  ) {
    return this.chats.removeMember(chatId, user.id, userId);
  }

  @Delete(':chatId')
  deleteGroup(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
  ) {
    return this.chats.deleteGroup(chatId, user.id);
  }
}
