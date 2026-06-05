import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ChatType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

@Injectable()
export class ChatsService {
  private readonly memberCache = new Map<string, number>();
  private readonly activeMemberIdsCache = new Map<
    string,
    { expiresAt: number; userIds: string[] }
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeService,
  ) {}

  async assertMember(chatId: string, userId: string) {
    const cacheKey = this.getMemberCacheKey(chatId, userId);
    const cachedUntil = this.memberCache.get(cacheKey);
    if (cachedUntil && cachedUntil > Date.now()) {
      return true;
    }

    const member = await this.prisma.chatMember.findFirst({
      where: { chatId, userId, deletedAt: null, chat: { deletedAt: null } },
    });
    if (!member) throw new ForbiddenException('You are not a member of this chat');

    this.memberCache.set(cacheKey, Date.now() + 30_000);
    return member;
  }

  async list(userId: string) {
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

  async get(chatId: string, userId: string) {
    await this.assertMember(chatId, userId);
    return this.prisma.chat.findUnique({
      where: { id: chatId },
      include: this.includeChat(),
    });
  }

  async createDirect(userId: string, dto: CreateDirectChatDto) {
    if (dto.userId === userId) {
      throw new BadRequestException('Cannot create a direct chat with yourself');
    }

    await this.assertProfilesExist([userId, dto.userId]);

    const existing = await this.prisma.chat.findFirst({
      where: {
        type: ChatType.DIRECT,
        deletedAt: null,
        members: {
          every: { userId: { in: [userId, dto.userId] } },
          some: { userId, deletedAt: null },
        },
      },
      include: { members: true },
    });

    if (
      existing &&
      existing.members.filter((member) => member.deletedAt === null).length === 2
    ) {
      return this.get(existing.id, userId);
    }

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.DIRECT,
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

  async createGroup(userId: string, dto: CreateGroupChatDto) {
    const memberIds = [...new Set([userId, ...dto.memberIds])];
    await this.assertProfilesExist(memberIds);

    const chat = await this.prisma.chat.create({
      data: {
        type: ChatType.GROUP,
        name: dto.name.trim(),
        createdBy: userId,
        members: { create: memberIds.map((memberId) => ({ userId: memberId })) },
      },
      include: this.includeChat(),
    });

    this.emitChatCreated(chat);
    return chat;
  }

  async addMember(chatId: string, actorId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.deletedAt) throw new NotFoundException('Chat not found');
    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Members can only be added to group chats');
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
    this.clearChatMemberCache(chatId);
    this.realtime.emitToChat(chatId, 'chat.member_added', payload);
    this.realtime.emitToUser(userId, 'chat.member_added', payload);
    return member;
  }

  async removeMember(chatId: string, actorId: string, userId: string) {
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.deletedAt) throw new NotFoundException('Chat not found');
    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Members can only be removed from group chats');
    }

    await this.assertMember(chatId, actorId);
    const member = await this.prisma.chatMember.update({
      where: { chatId_userId: { chatId, userId } },
      data: { deletedAt: new Date() },
    });

    const payload = { chatId, userId };
    this.clearChatMemberCache(chatId);
    this.realtime.emitToChat(chatId, 'chat.member_removed', payload);
    this.realtime.emitToUser(userId, 'chat.member_removed', payload);
    return member;
  }

  async deleteGroup(chatId: string, userId: string) {
    await this.assertMember(chatId, userId);
    const chat = await this.prisma.chat.findUnique({ where: { id: chatId } });
    if (!chat || chat.deletedAt) throw new NotFoundException('Chat not found');
    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Only group chats can be deleted');
    }

    const deleted = await this.prisma.chat.update({
      where: { id: chatId },
      data: { deletedAt: new Date() },
    });

    this.clearChatMemberCache(chatId);
    this.realtime.emitToChat(chatId, 'chat.deleted', { chatId });
    return deleted;
  }

  async markRead(chatId: string, userId: string) {
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

  async getActiveMemberIds(chatId: string) {
    const cached = this.activeMemberIdsCache.get(chatId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.userIds;
    }

    const members = await this.prisma.chatMember.findMany({
      where: { chatId, deletedAt: null },
      select: { userId: true },
    });
    const userIds = members.map((member) => member.userId);
    this.activeMemberIdsCache.set(chatId, {
      expiresAt: Date.now() + 30_000,
      userIds,
    });
    return userIds;
  }

  private getMemberCacheKey(chatId: string, userId: string) {
    return `${chatId}:${userId}`;
  }

  private includeChat() {
    return {
      members: {
        where: { deletedAt: null },
        include: { user: true },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        include: { attachments: true, sender: true },
      },
    };
  }

  private async getUnreadCounts(
    userId: string,
    chats: { id: string; members: { userId: string; lastReadAt: Date | null }[] }[],
  ) {
    const unreadCounts = new Map<string, number>();
    const chatIds = chats.map((chat) => chat.id);
    if (chatIds.length === 0) return unreadCounts;

    const rows = await this.prisma.$queryRaw<{ chatId: string; count: number }[]>(
      Prisma.sql`
        select m.chat_id as "chatId", count(*)::int as "count"
        from public.messages m
        join public.chat_members cm
          on cm.chat_id = m.chat_id
          and cm.user_id = ${userId}::uuid
          and cm.deleted_at is null
        where m.chat_id in (${Prisma.join(
          chatIds.map((chatId) => Prisma.sql`${chatId}::uuid`),
        )})
          and m.sender_id <> ${userId}::uuid
          and m.deleted_at is null
          and (cm.last_read_at is null or m.created_at > cm.last_read_at)
        group by m.chat_id
      `,
    );

    for (const row of rows) {
      unreadCounts.set(row.chatId, Number(row.count));
    }

    return unreadCounts;
  }

  private async assertProfilesExist(userIds: string[]) {
    const count = await this.prisma.profile.count({
      where: { id: { in: [...new Set(userIds)] } },
    });
    if (count !== new Set(userIds).size) {
      throw new NotFoundException('One or more users were not found');
    }
  }

  private emitChatCreated(chat: { id: string; members: { userId: string }[] }) {
    for (const member of chat.members) {
      this.realtime.emitToUser(member.userId, 'chat.created', chat);
    }
  }

  private clearChatMemberCache(chatId: string) {
    this.activeMemberIdsCache.delete(chatId);
    for (const key of this.memberCache.keys()) {
      if (key.startsWith(`${chatId}:`)) this.memberCache.delete(key);
    }
  }
}
