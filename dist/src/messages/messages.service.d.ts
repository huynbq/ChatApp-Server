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
export declare class MessagesService {
    private readonly prisma;
    private readonly chats;
    private readonly realtime;
    constructor(prisma: PrismaService, chats: ChatsService, realtime: RealtimeService);
    list(chatId: string, userId: string, query: ListMessagesDto): Promise<{
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
    send(chatId: string, senderId: string, dto: SendMessageDto): Promise<FormattedMessage>;
    private formatSimpleMessage;
    edit(messageId: string, userId: string, dto: EditMessageDto): Promise<{
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
    softDelete(messageId: string, userId: string): Promise<{
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
    addAttachment(messageId: string, userId: string, attachment: {
        bucket: string;
        path: string;
        mimeType: string;
        sizeBytes: number;
    }): Promise<{
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
    getAttachmentTarget(messageId: string, userId: string): Promise<{
        chatId: string;
    }>;
    createPhotoMessage(chatId: string, senderId: string, content: string | undefined, replyToMessageId: string | undefined, mentionUserIds: string[]): Promise<FormattedMessage>;
    private assertMessageInChat;
    private assertMentionableUsers;
    private emitMentions;
    private emitChatListMessageCreated;
    private includeMessage;
    private formatMessage;
}
export {};
