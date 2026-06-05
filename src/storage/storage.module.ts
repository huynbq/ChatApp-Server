import { Module } from '@nestjs/common';
import { MessagesModule } from '../messages/messages.module';
import { UsersModule } from '../users/users.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [MessagesModule, UsersModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
