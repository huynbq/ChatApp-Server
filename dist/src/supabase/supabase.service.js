"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const supabase_js_1 = require("@supabase/supabase-js");
const ws_1 = __importDefault(require("ws"));
let SupabaseService = class SupabaseService {
    config;
    url;
    anonKey;
    client;
    verifiedUsers = new Map();
    constructor(config) {
        this.config = config;
        this.url = this.config.getOrThrow('SUPABASE_URL');
        this.anonKey = this.config.getOrThrow('SUPABASE_ANON_KEY');
        this.client = (0, supabase_js_1.createClient)(this.url, this.anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            realtime: { transport: ws_1.default },
        });
    }
    async getUserFromToken(token) {
        const cached = this.verifiedUsers.get(token);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.user;
        }
        const { data, error } = await this.client.auth.getClaims(token);
        if (error || !data?.claims?.sub) {
            throw new common_1.UnauthorizedException('Invalid Supabase access token');
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
    createUserClient(token) {
        return (0, supabase_js_1.createClient)(this.url, this.anonKey, {
            auth: { persistSession: false, autoRefreshToken: false },
            realtime: { transport: ws_1.default },
            global: { headers: { Authorization: `Bearer ${token}` } },
        });
    }
    getTokenCacheExpiry(token) {
        const maxCacheExpiry = Date.now() + 60_000;
        try {
            const [, payload] = token.split('.');
            const claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
            if (!claims.exp)
                return maxCacheExpiry;
            return Math.min(claims.exp * 1000, maxCacheExpiry);
        }
        catch {
            return maxCacheExpiry;
        }
    }
};
exports.SupabaseService = SupabaseService;
exports.SupabaseService = SupabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SupabaseService);
//# sourceMappingURL=supabase.service.js.map