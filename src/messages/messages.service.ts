import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { performance } from 'node:perf_hooks';
import { ChatsService } from '../chats/chats.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { EditMessageDto } from './dto/edit-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';

type FormattedMessage = {
  id: string;
  chatId: string;
  [key: string]: unknown;
};

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly chats: ChatsService,
    private readonly realtime: RealtimeService,
  ) {}

  async list(chatId: string, userId: string, query: ListMessagesDto) {
    await this.chats.assertMember(chatId, userId);

    const messages = await this.prisma.message.findMany({
      where: { chatId },
      cursor: query.beforeId ? { id: query.beforeId } : undefined,
      skip: query.beforeId ? 1 : undefined,
      take: query.limit,
      orderBy: { createdAt: 'desc' },
      include: this.includeMessage(),
    });

    return messages.map((message) => this.formatMessage(message)).reverse();
  }

  async send(chatId: string, senderId: string, dto: SendMessageDto) {
    const startedAt = performance.now();
    await this.chats.assertMember(chatId, senderId);
    const memberAt = performance.now();

    if (dto.replyToMessageId) {
      await this.assertMessageInChat(dto.replyToMessageId, chatId);
    }
    const replyAt = performance.now();

    const mentionUserIds = [...new Set(dto.mentionUserIds ?? [])];
    if (mentionUserIds.length) {
      await this.assertMentionableUsers(chatId, mentionUserIds);
    }
    const mentionsAt = performance.now();

    const isSimpleTextMessage = !dto.replyToMessageId && mentionUserIds.length === 0;
    let formatted: FormattedMessage;
    let messageCreatedAt: Date;

    if (isSimpleTextMessage) {
      const message = await this.prisma.message.create({
        data: {
          chatId,
          senderId,
          content: dto.content.trim(),
        },
        include: { sender: true },
      });
      formatted = this.formatSimpleMessage(message);
      messageCreatedAt = message.createdAt;
    } else {
      const message = await this.prisma.message.create({
        data: {
          chatId,
          senderId,
          replyToMessageId: dto.replyToMessageId,
          content: dto.content.trim(),
          mentions: {
            create: mentionUserIds.map((mentionedUserId) => ({
              mentionedUserId,
            })),
          },
        },
        include: this.includeMessage(),
      });
      formatted = this.formatMessage(message);
      messageCreatedAt = message.createdAt;
    }

    await this.prisma.chat.update({
      where: { id: chatId },
      data: { updatedAt: messageCreatedAt },
    });

    const createAt = performance.now();

    this.realtime.emitToChat(chatId, 'message.created', formatted);
    await this.emitChatListMessageCreated(chatId, formatted);
    this.emitMentions(formatted, mentionUserIds);
    const emitAt = performance.now();

    console.log(
      `[timing] POST /chats/${chatId}/messages service assertMember=${(
        memberAt - startedAt
      ).toFixed(1)}ms reply=${(replyAt - memberAt).toFixed(
        1,
      )}ms mentions=${(mentionsAt - replyAt).toFixed(1)}ms create=${(
        createAt - mentionsAt
      ).toFixed(1)}ms emit=${(emitAt - createAt).toFixed(1)}ms total=${(
        emitAt - startedAt
      ).toFixed(1)}ms`,
    );

    return formatted;
  }

  private formatSimpleMessage(
    message: Prisma.MessageGetPayload<{ include: { sender: true } }>,
  ) {
    return {
      ...message,
      attachments: [],
      isDeleted: false,
      mentions: [],
      replyToMessage: null,
    };
  }

  async edit(messageId: string, userId: string, dto: EditMessageDto) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.deletedAt) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can edit this message');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: dto.content.trim(), editedAt: new Date() },
      include: this.includeMessage(),
    });

    const formatted = this.formatMessage(updated);
    this.realtime.emitToChat(updated.chatId, 'message.edited', formatted);
    return formatted;
  }

  async softDelete(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.deletedAt) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can delete this message');
    }

    const deleted = await this.prisma.message.update({
      where: { id: messageId },
      data: { content: null, deletedAt: new Date() },
      include: this.includeMessage(),
    });

    const formatted = this.formatMessage(deleted);
    this.realtime.emitToChat(deleted.chatId, 'message.deleted', formatted);
    return formatted;
  }

  async addAttachment(
    messageId: string,
    userId: string,
    attachment: {
      bucket: string;
      path: string;
      mimeType: string;
      sizeBytes: number;
    },
  ) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.deletedAt) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can attach photos');
    }

    await this.prisma.messageAttachment.create({
      data: { messageId, ...attachment },
    });

    const updated = await this.prisma.message.findUniqueOrThrow({
      where: { id: messageId },
      include: this.includeMessage(),
    });

    const formatted = this.formatMessage(updated);
    this.realtime.emitToChat(message.chatId, 'message.edited', formatted);
    return formatted;
  }

  async getAttachmentTarget(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message || message.deletedAt) throw new NotFoundException('Message not found');
    if (message.senderId !== userId) {
      throw new ForbiddenException('Only the sender can attach photos');
    }
    return { chatId: message.chatId };
  }

  async createPhotoMessage(
    chatId: string,
    senderId: string,
    content: string | undefined,
    replyToMessageId: string | undefined,
    mentionUserIds: string[],
  ) {
    return this.send(chatId, senderId, {
      content: content?.trim() || 'Photo',
      replyToMessageId,
      mentionUserIds,
    });
  }

  private async assertMessageInChat(messageId: string, chatId: string) {
    const message = await this.prisma.message.findFirst({
      where: { id: messageId, chatId },
    });
    if (!message) throw new BadRequestException('Reply message is not in this chat');
  }

  private async assertMentionableUsers(chatId: string, userIds: string[]) {
    const count = await this.prisma.chatMember.count({
      where: { chatId, userId: { in: userIds }, deletedAt: null },
    });
    if (count !== userIds.length) {
      throw new BadRequestException('Mentioned users must be active chat members');
    }
  }

  private emitMentions(message: unknown, userIds: string[]) {
    for (const userId of userIds) {
      this.realtime.emitToUser(userId, 'message.mentioned', message);
    }
  }

  private async emitChatListMessageCreated(chatId: string, message: FormattedMessage) {
    const members = await this.prisma.chatMember.findMany({
      where: { chatId, deletedAt: null },
      select: { userId: true },
    });

    for (const member of members) {
      this.realtime.emitToUser(member.userId, 'chat.message_created', message);
    }
  }

  private includeMessage() {
    return {
      sender: true,
      replyToMessage: {
        include: { sender: true, attachments: true },
      },
      attachments: true,
      mentions: { include: { mentionedUser: true } },
    };
  }

  private formatMessage(
    message: Prisma.MessageGetPayload<{ include: ReturnType<MessagesService['includeMessage']> }>,
  ) {
    const isDeleted = message.deletedAt !== null;
    return {
      ...message,
      isDeleted,
      content: isDeleted ? null : message.content,
    };
  }
}
