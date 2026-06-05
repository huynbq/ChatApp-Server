import { forwardRef, Module } from '@nestjs/common';
import { ChatsModule } from '../chats/chats.module';
import { UsersModule } from '../users/users.module';
import { RealtimeGateway } from './realtime.gateway';
import { RealtimeService } from './realtime.service';

@Module({
  imports: [UsersModule, forwardRef(() => ChatsModule)],
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}
