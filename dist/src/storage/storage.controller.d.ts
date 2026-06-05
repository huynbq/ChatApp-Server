import type { CurrentUser } from '../common/types/current-user';
import { MessagesService } from '../messages/messages.service';
import { StorageService } from './storage.service';
export declare class StorageController {
    private readonly storage;
    private readonly messages;
    constructor(storage: StorageService, messages: MessagesService);
    attachToMessage(user: CurrentUser, messageId: string, file: Express.Multer.File): Promise<{
        isDeleted: boolean;
        content: string | null;
        mentions: ({
            mentionedUser: {
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
            messageId: string;
            mentionedUserId: string;
        })[];
        sender: {
            id: string;
            username: string | null;
            email: string | null;
            displayName: string | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        replyToMessage: ({
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
        }) | null;
        attachments: {
            id: string;
            createdAt: Date;
            messageId: string;
            bucket: string;
            path: string;
            mimeType: string;
            sizeBytes: number;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string;
        deletedAt: Date | null;
        senderId: string;
        replyToMessageId: string | null;
        editedAt: Date | null;
    }>;
    createPhotoMessage(user: CurrentUser, chatId: string, file: Express.Multer.File, content?: string, replyToMessageId?: string, mentionUserIds?: string): Promise<{
        isDeleted: boolean;
        content: string | null;
        mentions: ({
            mentionedUser: {
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
            messageId: string;
            mentionedUserId: string;
        })[];
        sender: {
            id: string;
            username: string | null;
            email: string | null;
            displayName: string | null;
            avatarUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        replyToMessage: ({
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
        }) | null;
        attachments: {
            id: string;
            createdAt: Date;
            messageId: string;
            bucket: string;
            path: string;
            mimeType: string;
            sizeBytes: number;
        }[];
        id: string;
        createdAt: Date;
        updatedAt: Date;
        chatId: string;
        deletedAt: Date | null;
        senderId: string;
        replyToMessageId: string | null;
        editedAt: Date | null;
    }>;
    private parseMentionUserIds;
}
