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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const node_perf_hooks_1 = require("node:perf_hooks");
const supabase_service_1 = require("../supabase/supabase.service");
const users_service_1 = require("../users/users.service");
let AuthGuard = class AuthGuard {
    supabase;
    users;
    constructor(supabase, users) {
        this.supabase = supabase;
        this.users = users;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const startedAt = node_perf_hooks_1.performance.now();
        const token = this.extractBearerToken(request.headers.authorization);
        const tokenAt = node_perf_hooks_1.performance.now();
        const user = await this.supabase.getUserFromToken(token);
        const authAt = node_perf_hooks_1.performance.now();
        await this.users.ensureProfileForRequest(user);
        const profileAt = node_perf_hooks_1.performance.now();
        request.user = user;
        console.log(`[timing] ${request.method} ${request.url} auth.guard token=${(tokenAt - startedAt).toFixed(1)}ms supabase=${(authAt - tokenAt).toFixed(1)}ms profile=${(profileAt - authAt).toFixed(1)}ms total=${(profileAt - startedAt).toFixed(1)}ms`);
        return true;
    }
    extractBearerToken(header) {
        const [type, token] = header?.split(' ') ?? [];
        if (type !== 'Bearer' || !token) {
            throw new common_1.UnauthorizedException('Missing bearer token');
        }
        return token;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        users_service_1.UsersService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map