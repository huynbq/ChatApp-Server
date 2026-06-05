import type { CurrentUser } from '../common/types/current-user';
import { EditMessageDto } from './dto/edit-message.dto';
import { ListMessagesDto } from './dto/list-messages.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messages;
    constructor(messages: MessagesService);
    list(user: CurrentUser, chatId: string, query: ListMessagesDto): Promise<{
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
    }[]>;
    send(user: CurrentUser, chatId: string, dto: SendMessageDto): Promise<{
        [key: string]: unknown;
        id: string;
        chatId: string;
    }>;
    edit(user: CurrentUser, messageId: string, dto: EditMessageDto): Promise<{
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
    softDelete(user: CurrentUser, messageId: string): Promise<{
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
}
