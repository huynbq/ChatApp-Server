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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chats_service_1 = require("../chats/chats.service");
const supabase_service_1 = require("../supabase/supabase.service");
const users_service_1 = require("../users/users.service");
const realtime_service_1 = require("./realtime.service");
let RealtimeGateway = class RealtimeGateway {
    realtime;
    supabase;
    users;
    chats;
    server;
    constructor(realtime, supabase, users, chats) {
        this.realtime = realtime;
        this.supabase = supabase;
        this.users = users;
        this.chats = chats;
    }
    afterInit(server) {
        this.realtime.bindServer(server);
    }
    async handleConnection(client) {
        try {
            const token = this.extractToken(client);
            const user = await this.supabase.getUserFromToken(token);
            await this.users.ensureProfileForRequest(user);
            client.user = user;
            await client.join(`user:${user.id}`);
        }
        catch {
            client.disconnect(true);
        }
    }
    async joinChat(client, body) {
        const user = this.requireUser(client);
        await this.chats.assertMember(body.chatId, user.id);
        await client.join(`chat:${body.chatId}`);
        return { ok: true };
    }
    async leaveChat(client, body) {
        await client.leave(`chat:${body.chatId}`);
        return { ok: true };
    }
    extractToken(client) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken)
            return authToken;
        const authorization = client.handshake.headers.authorization;
        const [type, token] = authorization?.split(' ') ?? [];
        if (type === 'Bearer' && token)
            return token;
        throw new common_1.UnauthorizedException('Missing websocket token');
    }
    requireUser(client) {
        if (!client.user)
            throw new common_1.UnauthorizedException('Unauthenticated socket');
        return client.user;
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat.join'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "joinChat", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('chat.leave'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], RealtimeGateway.prototype, "leaveChat", null);
exports.RealtimeGateway = RealtimeGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: { origin: process.env.FRONTEND_ORIGIN ?? true } }),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => chats_service_1.ChatsService))),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService,
        supabase_service_1.SupabaseService,
        users_service_1.UsersService,
        chats_service_1.ChatsService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map