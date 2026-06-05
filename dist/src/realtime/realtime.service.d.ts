import { Server } from 'socket.io';
export declare class RealtimeService {
    private server?;
    bindServer(server: Server): void;
    emitToChat(chatId: string, event: string, payload: unknown): void;
    emitToUser(userId: string, event: string, payload: unknown): void;
}
