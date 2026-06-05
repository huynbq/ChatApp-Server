import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
export declare class ChatsService {
    private readonly prisma;
    private readonly realtime;
    private readonly memberCache;
    constructor(prisma: PrismaService, realtime: RealtimeService);
    assertMember(chatId: string, userId: string): Promise<true | {
        id: string;
        createdAt: Date;
        userId: string;
        chatId: string;
        deletedAt: Date | null;
        lastReadAt: Date | null;
    }>;
    list(userId: string): Promise<{
        unreadCount: number;
        messages: ({
            sender: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            attachments: {
                id: string;
                createdAt: Date;
                messageId: string;
                bucket: string;
                path: string;
                mimeType: string;
                sizeBytes: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chatId: string;
            deletedAt: Date | null;
            senderId: string;
            replyToMessageId: string | null;
            content: string | null;
            editedAt: Date | null;
        })[];
        members: ({
            user: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            chatId: string;
            deletedAt: Date | null;
            lastReadAt: Date | null;
        })[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }[]>;
    get(chatId: string, userId: string): Promise<({
        messages: ({
            sender: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            attachments: {
                id: string;
                createdAt: Date;
                messageId: string;
                bucket: string;
                path: string;
                mimeType: string;
                sizeBytes: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chatId: string;
            deletedAt: Date | null;
            senderId: string;
            replyToMessageId: string | null;
            content: string | null;
            editedAt: Date | null;
        })[];
        members: ({
            user: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            chatId: string;
            deletedAt: Date | null;
            lastReadAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }) | null>;
    createDirect(userId: string, dto: CreateDirectChatDto): Promise<({
        messages: ({
            sender: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            attachments: {
                id: string;
                createdAt: Date;
                messageId: string;
                bucket: string;
                path: string;
                mimeType: string;
                sizeBytes: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chatId: string;
            deletedAt: Date | null;
            senderId: string;
            replyToMessageId: string | null;
            content: string | null;
            editedAt: Date | null;
        })[];
        members: ({
            user: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            chatId: string;
            deletedAt: Date | null;
            lastReadAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }) | null>;
    createGroup(userId: string, dto: CreateGroupChatDto): Promise<{
        messages: ({
            sender: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            attachments: {
                id: string;
                createdAt: Date;
                messageId: string;
                bucket: string;
                path: string;
                mimeType: string;
                sizeBytes: number;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            chatId: string;
            deletedAt: Date | null;
            senderId: string;
            replyToMessageId: string | null;
            content: string | null;
            editedAt: Date | null;
        })[];
        members: ({
            user: {
                id: string;
                username: string | null;
                email: string | null;
                displayName: string | null;
                avatarUrl: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            userId: string;
            chatId: string;
            deletedAt: Date | null;
            lastReadAt: Date | null;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }>;
    addMember(chatId: string, actorId: string, userId: string): Promise<{
        user: {
            id: string;
            username: string | null;
            email: string | null;
            displayName: string | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        chatId: string;
        deletedAt: Date | null;
        lastReadAt: Date | null;
    }>;
    removeMember(chatId: string, actorId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        chatId: string;
        deletedAt: Date | null;
        lastReadAt: Date | null;
    }>;
    deleteGroup(chatId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }>;
    markRead(chatId: string, userId: string): Promise<{
        chatId: string;
        userId: string;
        lastReadAt: Date;
    }>;
    private getMemberCacheKey;
    private includeChat;
    private getUnreadCounts;
    private assertProfilesExist;
    private emitChatCreated;
}
