import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser as CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/types/current-user';
import { EditMessageDto } from './dto/edit-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@UseGuards(AuthGuard)
@Controller()
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get('chats/:chatId/messages')
  list(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
    @Query() query: ListMessagesDto,
  ) {
    return this.messages.list(chatId, user.id, query);
  }

  @Post('chats/:chatId/messages')
  send(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messages.send(chatId, user.id, dto);
  }

  @Patch('messages/:messageId')
  edit(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('messageId') messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messages.edit(messageId, user.id, dto);
  }

  @Delete('messages/:messageId')
  softDelete(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('messageId') messageId: string,
  ) {
    return this.messages.softDelete(messageId, user.id);
  }
}
