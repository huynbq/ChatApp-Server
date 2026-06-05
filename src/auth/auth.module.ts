import { Global, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [UsersModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}
