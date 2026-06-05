import { Inject, UnauthorizedException, forwardRef } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from '../chats/chats.service';
import { CurrentUser } from '../common/types/current-user';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { RealtimeService } from './realtime.service';

type AuthenticatedSocket = Socket & { user?: CurrentUser };

@WebSocketGateway({ cors: { origin: process.env.FRONTEND_ORIGIN ?? true } })
export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtime: RealtimeService,
    private readonly supabase: SupabaseService,
    private readonly users: UsersService,
    @Inject(forwardRef(() => ChatsService))
    private readonly chats: ChatsService,
  ) {}

  afterInit(server: Server) {
    this.realtime.bindServer(server);
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      const user = await this.supabase.getUserFromToken(token);
      await this.users.ensureProfileForRequest(user);
      client.user = user;
      await client.join(`user:${user.id}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('chat.join')
  async joinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { chatId: string },
  ) {
    const user = this.requireUser(client);
    await this.chats.assertMember(body.chatId, user.id);
    await client.join(`chat:${body.chatId}`);
    return { ok: true };
  }

  @SubscribeMessage('chat.leave')
  async leaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { chatId: string },
  ) {
    await client.leave(`chat:${body.chatId}`);
    return { ok: true };
  }

  private extractToken(client: Socket): string {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken) return authToken;

    const authorization = client.handshake.headers.authorization;
    const [type, token] = authorization?.split(' ') ?? [];
    if (type === 'Bearer' && token) return token;

    throw new UnauthorizedException('Missing websocket token');
  }

  private requireUser(client: AuthenticatedSocket): CurrentUser {
    if (!client.user) throw new UnauthorizedException('Unauthenticated socket');
    return client.user;
  }
}
