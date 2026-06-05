import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { StorageModule } from './storage/storage.module';
import { SupabaseModule } from './supabase/supabase.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SupabaseModule,
    AuthModule,
    UsersModule,
    RealtimeModule,
    ChatsModule,
    MessagesModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
