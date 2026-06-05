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
exports.ChatsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const realtime_service_1 = require("../realtime/realtime.service");
let ChatsService = class ChatsService {
    prisma;
    realtime;
    memberCache = new Map();
    constructor(prisma, realtime) {
        this.prisma = prisma;
        this.realtime = realtime;
    }
    async assertMember(chatId, userId) {
        const cacheKey = this.getMemberCacheKey(chatId, userId);
        const cachedUntil = this.memberCache.get(cacheKey);
        if (cachedUntil && cachedUntil > Date.now()) {
            return true;
        }
        const member = await this.prisma.chatMember.findFirst({
            where: { chatId, userId, deletedAt: null, chat: { deletedAt: null } },
        });
        if (!member)
            throw new common_1.ForbiddenException('You are not a member of this chat');
        this.memberCache.set(cacheKey, Date.now() + 30_000);
        return member;
    }
    async list(userId) {
        const chats = await this.prisma.chat.findMany({
            where: {
                deletedAt: null,
                members: { some: { userId, deletedAt: null } },
            },
            include: this.includeChat(),
            orderBy: { updatedAt: 'desc' },
        });
        const unreadCounts = await this.getUnreadCounts(userId, chats);
        return chats
            .map((chat) => ({ ...chat, unreadCount: unreadCounts.get(chat.id) ?? 0 }))
            .sort((left, right) => {
            const leftTime = left.messages[0]?.createdAt ?? left.updatedAt;
            const rightTime = right.messages[0]?.createdAt ?? right.updatedAt;
            return rightTime.getTime() - leftTime.getTime();
        });
    }
    async get(chatId, userId) {
        await this.assertMember(chatId, userId);
        return this.prisma.chat.findUnique({
            where: { id: chatId },
            include: this.includeChat(),
        });
    }
    async createDirect(userId, dto) {
        if (dto.userId === userId) {
            throw new common_1.BadRequestException('Cannot create a direct chat with yourself');
        }
        await this.assertProfilesExist([userId, dto.userId]);
        const existing = await this.prisma.chat.findFirst({
            where: {
                type: client_1.ChatType.DIRECT,
                deletedAt: null,
                members: {
                    every: { userId: { in: [userId, dto.userId] } },
                    some: { userId, deletedAt: null },
                },
            },
            include: { members: true },
        });
        if (existing &&
            existing.members.filter((member) => member.deletedAt === null).length === 2) {
            return this.get(existing.id, userId);
        }
        const chat = await this.prisma.chat.create({
            data: {
                type: client_1.ChatType.DIRECT,
                createdBy: userId,
                members: {
                    create: [{ userId }, { userId: dto.userId }],
                },
            },
            include: this.includeChat(),
        });
        this.emitChatCreated(chat);
        return chat;
    }
    async createGroup(userId, dto) {
        const memberIds = [...new Set([userId, ...dto.memberIds])];
        await this.assertProfilesExist(memberIds);
        const chat = await this.prisma.chat.create({
            data: {
                type: client_1.ChatType.GROUP,
                name: dto.name.trim(),
                createdBy: userId,
                members: { create: memberIds.map((memberId) => ({ userId: memberId })) },
            },
            include: this.includeChat(),
        });
        this.emitChatCreated(chat);
        return chat;
    }
    async addMember(chatId, actorId, userId) {
        const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat || chat.deletedAt)
            throw new common_1.NotFoundException('Chat not found');
        if (chat.type !== client_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('Members can only be added to group chats');
        }
        await this.assertMember(chatId, actorId);
        await this.assertProfilesExist([userId]);
        const member = await this.prisma.chatMember.upsert({
            where: { chatId_userId: { chatId, userId } },
            update: { deletedAt: null },
            create: { chatId, userId },
            include: { user: true },
        });
        const payload = { chatId, member };
        this.memberCache.delete(this.getMemberCacheKey(chatId, userId));
        this.realtime.emitToChat(chatId, 'chat.member_added', payload);
        this.realtime.emitToUser(userId, 'chat.member_added', payload);
        return member;
    }
    async removeMember(chatId, actorId, userId) {
        const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat || chat.deletedAt)
            throw new common_1.NotFoundException('Chat not found');
        if (chat.type !== client_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('Members can only be removed from group chats');
        }
        await this.assertMember(chatId, actorId);
        const member = await this.prisma.chatMember.update({
            where: { chatId_userId: { chatId, userId } },
            data: { deletedAt: new Date() },
        });
        const payload = { chatId, userId };
        this.memberCache.delete(this.getMemberCacheKey(chatId, userId));
        this.realtime.emitToChat(chatId, 'chat.member_removed', payload);
        this.realtime.emitToUser(userId, 'chat.member_removed', payload);
        return member;
    }
    async deleteGroup(chatId, userId) {
        await this.assertMember(chatId, userId);
        const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
        if (!chat || chat.deletedAt)
            throw new common_1.NotFoundException('Chat not found');
        if (chat.type !== client_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('Only group chats can be deleted');
        }
        const deleted = await this.prisma.chat.update({
            where: { id: chatId },
            data: { deletedAt: new Date() },
        });
        this.realtime.emitToChat(chatId, 'chat.deleted', { chatId });
        return deleted;
    }
    async markRead(chatId, userId) {
        await this.assertMember(chatId, userId);
        const lastReadAt = new Date();
        await this.prisma.chatMember.update({
            where: { chatId_userId: { chatId, userId } },
            data: { lastReadAt },
        });
        const payload = { chatId, userId, lastReadAt };
        this.realtime.emitToChat(chatId, 'chat.read', payload);
        this.realtime.emitToUser(userId, 'chat.read', payload);
        return payload;
    }
    getMemberCacheKey(chatId, userId) {
        return `${chatId}:${userId}`;
    }
    includeChat() {
        return {
            members: {
                where: { deletedAt: null },
                include: { user: true },
            },
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: { attachments: true, sender: true },
            },
        };
    }
    async getUnreadCounts(userId, chats) {
        const unreadCounts = new Map();
        await Promise.all(chats.map(async (chat) => {
            const currentMember = chat.members.find((member) => member.userId === userId);
            const count = await this.prisma.message.count({
                where: {
                    chatId: chat.id,
                    senderId: { not: userId },
                    deletedAt: null,
                    ...(currentMember?.lastReadAt
                        ? { createdAt: { gt: currentMember.lastReadAt } }
                        : {}),
                },
            });
            unreadCounts.set(chat.id, count);
        }));
        return unreadCounts;
    }
    async assertProfilesExist(userIds) {
        const count = await this.prisma.profile.count({
            where: { id: { in: [...new Set(userIds)] } },
        });
        if (count !== new Set(userIds).size) {
            throw new common_1.NotFoundException('One or more users were not found');
        }
    }
    emitChatCreated(chat) {
        for (const member of chat.members) {
            this.realtime.emitToUser(member.userId, 'chat.created', chat);
        }
    }
};
exports.ChatsService = ChatsService;
exports.ChatsService = ChatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        realtime_service_1.RealtimeService])
], ChatsService);
//# sourceMappingURL=chats.service.js.map