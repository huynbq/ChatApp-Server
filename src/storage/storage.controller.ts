import {
  Body,
  Controller,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser as CurrentUserDecorator } from '../common/decorators/current-user.decorator';
import type { CurrentUser } from '../common/types/current-user';
import { MessagesService } from '../messages/messages.service';
import { StorageService } from './storage.service';

@UseGuards(AuthGuard)
@Controller()
export class StorageController {
  constructor(
    private readonly storage: StorageService,
    private readonly messages: MessagesService,
  ) {}

  @Post('messages/:messageId/attachments')
  @UseInterceptors(FileInterceptor('photo'))
  async attachToMessage(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('messageId') messageId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { chatId } = await this.messages.getAttachmentTarget(messageId, user.id);
    const uploaded = await this.storage.uploadPhoto(user.token, chatId, messageId, file);
    return this.messages.addAttachment(messageId, user.id, uploaded);
  }

  @Post('chats/:chatId/messages/photo')
  @UseInterceptors(FileInterceptor('photo'))
  async createPhotoMessage(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('chatId') chatId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('content') content?: string,
    @Body('replyToMessageId') replyToMessageId?: string,
    @Body('mentionUserIds') mentionUserIds?: string,
  ) {
    const message = await this.messages.createPhotoMessage(
      chatId,
      user.id,
      content,
      replyToMessageId,
      this.parseMentionUserIds(mentionUserIds),
    );
    const uploaded = await this.storage.uploadPhoto(user.token, chatId, message.id, file);
    return this.messages.addAttachment(message.id, user.id, uploaded);
  }

  private parseMentionUserIds(value?: string) {
    if (!value) return [];
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
