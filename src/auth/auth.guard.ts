import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { performance } from 'node:perf_hooks';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
import { RequestWithUser } from '../common/types/request-with-user';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly supabase: SupabaseService,
    private readonly users: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const startedAt = performance.now();
    const token = this.extractBearerToken(request.headers.authorization);
    const tokenAt = performance.now();
    const user = await this.supabase.getUserFromToken(token);
    const authAt = performance.now();
    await this.users.ensureProfileForRequest(user);
    const profileAt = performance.now();
    request.user = user;

    console.log(
      `[timing] ${request.method} ${request.url} auth.guard token=${(
        tokenAt - startedAt
      ).toFixed(1)}ms supabase=${(authAt - tokenAt).toFixed(
        1,
      )}ms profile=${(profileAt - authAt).toFixed(1)}ms total=${(
        profileAt - startedAt
      ).toFixed(1)}ms`,
    );

    return true;
  }

  private extractBearerToken(header?: string): string {
    const [type, token] = header?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Missing bearer token');
    }
    return token;
  }
}
