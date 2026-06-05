import { Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { RealtimeModule } from '../realtime/realtime.module';
import { UsersModule } from '../users/users.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [ChatsModule, RealtimeModule, UsersModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
