import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import ws from 'ws';
import { CurrentUser } from '../common/types/current-user';

@Injectable()
export class SupabaseService {
  private readonly url: string;
  private readonly anonKey: string;
  private readonly client: SupabaseClient;
  private readonly verifiedUsers = new Map<
    string,
    { expiresAt: number; user: CurrentUser }
  >();

  constructor(private readonly config: ConfigService) {
    this.url = this.config.getOrThrow<string>('SUPABASE_URL');
    this.anonKey = this.config.getOrThrow<string>('SUPABASE_ANON_KEY');
    this.client = createClient(this.url, this.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws as any },
    });
  }

  async getUserFromToken(token: string): Promise<CurrentUser> {
    const cached = this.verifiedUsers.get(token);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.user;
    }

    const { data, error } = await this.client.auth.getClaims(token);

    if (error || !data?.claims?.sub) {
      throw new UnauthorizedException('Invalid Supabase access token');
    }

    const user = {
      id: data.claims.sub,
      email: typeof data.claims.email === 'string' ? data.claims.email : null,
      token,
    };

    this.verifiedUsers.set(token, {
      expiresAt: this.getTokenCacheExpiry(token),
      user,
    });

    return user;
  }

  createUserClient(token: string): SupabaseClient {
    return createClient(this.url, this.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      realtime: { transport: ws as any },
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
  }

  private getTokenCacheExpiry(token: string) {
    const maxCacheExpiry = Date.now() + 60_000;

    try {
      const [, payload] = token.split('.');
      const claims = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
        exp?: number;
      };

      if (!claims.exp) return maxCacheExpiry;
      return Math.min(claims.exp * 1000, maxCacheExpiry);
    } catch {
      return maxCacheExpiry;
    }
  }
}
