import { forwardRef, Module } from '@nestjs/common';
import { RealtimeModule } from '../realtime/realtime.module';
import { UsersModule } from '../users/users.module';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

@Module({
  imports: [UsersModule, forwardRef(() => RealtimeModule)],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
