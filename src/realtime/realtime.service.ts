import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server?: Server;

  bindServer(server: Server) {
    this.server = server;
  }

  emitToChat(chatId: string, event: string, payload: unknown) {
    this.server?.to(`chat:${chatId}`).emit(event, payload);
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server?.to(`user:${userId}`).emit(event, payload);
  }
}
