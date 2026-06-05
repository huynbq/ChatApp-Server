import { OnGatewayConnection, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from '../chats/chats.service';
import { CurrentUser } from '../common/types/current-user';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { RealtimeService } from './realtime.service';
type AuthenticatedSocket = Socket & {
    user?: CurrentUser;
};
export declare class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
    private readonly realtime;
    private readonly supabase;
    private readonly users;
    private readonly chats;
    server: Server;
    constructor(realtime: RealtimeService, supabase: SupabaseService, users: UsersService, chats: ChatsService);
    afterInit(server: Server): void;
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    joinChat(client: AuthenticatedSocket, body: {
        chatId: string;
    }): Promise<{
        ok: boolean;
    }>;
    leaveChat(client: AuthenticatedSocket, body: {
        chatId: string;
    }): Promise<{
        ok: boolean;
    }>;
    private extractToken;
    private requireUser;
}
export {};
