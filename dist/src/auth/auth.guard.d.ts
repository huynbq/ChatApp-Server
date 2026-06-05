import { CanActivate, ExecutionContext } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { UsersService } from '../users/users.service';
export declare class AuthGuard implements CanActivate {
    private readonly supabase;
    private readonly users;
    constructor(supabase: SupabaseService, users: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractBearerToken;
}
