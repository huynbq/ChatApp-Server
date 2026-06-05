import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import { CurrentUser } from '../common/types/current-user';
export declare class SupabaseService {
    private readonly config;
    private readonly url;
    private readonly anonKey;
    private readonly client;
    private readonly verifiedUsers;
    constructor(config: ConfigService);
    getUserFromToken(token: string): Promise<CurrentUser>;
    createUserClient(token: string): SupabaseClient;
    private getTokenCacheExpiry;
}
