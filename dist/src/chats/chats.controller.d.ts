import type { CurrentUser } from '../common/types/current-user';
import { AddChatMemberDto } from './dto/add-chat-member.dto';
import { CreateDirectChatDto } from './dto/create-direct-chat.dto';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';
import { ChatsService } from './chats.service';
export declare class ChatsController {
    private readonly chats;
    constructor(chats: ChatsService);
    list(user: CurrentUser): Promise<{
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
    get(user: CurrentUser, chatId: string): Promise<({
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
    markRead(user: CurrentUser, chatId: string): Promise<{
        chatId: string;
        userId: string;
        lastReadAt: Date;
    }>;
    createDirect(user: CurrentUser, dto: CreateDirectChatDto): Promise<({
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
    createGroup(user: CurrentUser, dto: CreateGroupChatDto): Promise<{
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
    addMember(user: CurrentUser, chatId: string, dto: AddChatMemberDto): Promise<{
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
    removeMember(user: CurrentUser, chatId: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        chatId: string;
        deletedAt: Date | null;
        lastReadAt: Date | null;
    }>;
    deleteGroup(user: CurrentUser, chatId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string | null;
        type: import("@prisma/client").$Enums.ChatType;
        deletedAt: Date | null;
        createdBy: string;
    }>;
}
