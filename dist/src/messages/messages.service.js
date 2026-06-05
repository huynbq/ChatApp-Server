"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesService = void 0;
const common_1 = require("@nestjs/common");
const node_perf_hooks_1 = require("node:perf_hooks");
const chats_service_1 = require("../chats/chats.service");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
let MessagesService = class MessagesService {
    prisma;
    chats;
    realtime;
    constructor(prisma, chats, realtime) {
        this.prisma = prisma;
        this.chats = chats;
        this.realtime = realtime;
    }
    async list(chatId, userId, query) {
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
    async send(chatId, senderId, dto) {
        const startedAt = node_perf_hooks_1.performance.now();
        await this.chats.assertMember(chatId, senderId);
        const memberAt = node_perf_hooks_1.performance.now();
        if (dto.replyToMessageId) {
            await this.assertMessageInChat(dto.replyToMessageId, chatId);
        }
        const replyAt = node_perf_hooks_1.performance.now();
        const mentionUserIds = [...new Set(dto.mentionUserIds ?? [])];
        if (mentionUserIds.length) {
            await this.assertMentionableUsers(chatId, mentionUserIds);
        }
        const mentionsAt = node_perf_hooks_1.performance.now();
        const isSimpleTextMessage = !dto.replyToMessageId && mentionUserIds.length === 0;
        let formatted;
        let messageCreatedAt;
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
        }
        else {
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
        const createAt = node_perf_hooks_1.performance.now();
        this.realtime.emitToChat(chatId, 'message.created', formatted);
        await this.emitChatListMessageCreated(chatId, formatted);
        this.emitMentions(formatted, mentionUserIds);
        const emitAt = node_perf_hooks_1.performance.now();
        console.log(`[timing] POST /chats/${chatId}/messages service assertMember=${(memberAt - startedAt).toFixed(1)}ms reply=${(replyAt - memberAt).toFixed(1)}ms mentions=${(mentionsAt - replyAt).toFixed(1)}ms create=${(createAt - mentionsAt).toFixed(1)}ms emit=${(emitAt - createAt).toFixed(1)}ms total=${(emitAt - startedAt).toFixed(1)}ms`);
        return formatted;
    }
    formatSimpleMessage(message) {
        return {
            ...message,
            attachments: [],
            isDeleted: false,
            mentions: [],
            replyToMessage: null,
        };
    }
    async edit(messageId, userId, dto) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.deletedAt)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Only the sender can edit this message');
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
    async softDelete(messageId, userId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.deletedAt)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Only the sender can delete this message');
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
    async addAttachment(messageId, userId, attachment) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.deletedAt)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Only the sender can attach photos');
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
    async getAttachmentTarget(messageId, userId) {
        const message = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!message || message.deletedAt)
            throw new common_1.NotFoundException('Message not found');
        if (message.senderId !== userId) {
            throw new common_1.ForbiddenException('Only the sender can attach photos');
        }
        return { chatId: message.chatId };
    }
    async createPhotoMessage(chatId, senderId, content, replyToMessageId, mentionUserIds) {
        return this.send(chatId, senderId, {
            content: content?.trim() || 'Photo',
            replyToMessageId,
            mentionUserIds,
        });
    }
    async assertMessageInChat(messageId, chatId) {
        const message = await this.prisma.message.findFirst({
            where: { id: messageId, chatId },
        });
        if (!message)
            throw new common_1.BadRequestException('Reply message is not in this chat');
    }
    async assertMentionableUsers(chatId, userIds) {
        const count = await this.prisma.chatMember.count({
            where: { chatId, userId: { in: userIds }, deletedAt: null },
        });
        if (count !== userIds.length) {
            throw new common_1.BadRequestException('Mentioned users must be active chat members');
        }
    }
    emitMentions(message, userIds) {
        for (const userId of userIds) {
            this.realtime.emitToUser(userId, 'message.mentioned', message);
        }
    }
    async emitChatListMessageCreated(chatId, message) {
        const members = await this.prisma.chatMember.findMany({
            where: { chatId, deletedAt: null },
            select: { userId: true },
        });
        for (const member of members) {
            this.realtime.emitToUser(member.userId, 'chat.message_created', message);
        }
    }
    includeMessage() {
        return {
            sender: true,
            replyToMessage: {
                include: { sender: true, attachments: true },
            },
            attachments: true,
            mentions: { include: { mentionedUser: true } },
        };
    }
    formatMessage(message) {
        const isDeleted = message.deletedAt !== null;
        return {
            ...message,
            isDeleted,
            content: isDeleted ? null : message.content,
        };
    }
};
exports.MessagesService = MessagesService;
exports.MessagesService = MessagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chats_service_1.ChatsService,
        realtime_service_1.RealtimeService])
], MessagesService);
//# sourceMappingURL=messages.service.js.map