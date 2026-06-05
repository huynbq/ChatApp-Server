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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    ensuredProfiles = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async ensureProfile(user) {
        return this.prisma.profile.upsert({
            where: { id: user.id },
            update: { email: user.email },
            create: {
                id: user.id,
                email: user.email,
                displayName: user.email?.split('@')[0] ?? 'New user',
            },
        });
    }
    async getMe(user) {
        return this.ensureProfile(user);
    }
    async ensureProfileForRequest(user) {
        const cachedUntil = this.ensuredProfiles.get(user.id);
        if (cachedUntil && cachedUntil > Date.now()) {
            return;
        }
        await this.ensureProfile(user);
        this.ensuredProfiles.set(user.id, Date.now() + 5 * 60_000);
    }
    async updateMe(user, dto) {
        try {
            return await this.prisma.profile.update({
                where: { id: user.id },
                data: {
                    username: dto.username,
                    displayName: dto.displayName,
                    avatarUrl: dto.avatarUrl,
                },
            });
        }
        catch (error) {
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002') {
                throw new common_1.BadRequestException('Username is already taken');
            }
            throw error;
        }
    }
    async search(query, currentUserId) {
        const q = query.trim();
        return this.prisma.profile.findMany({
            where: {
                id: { not: currentUserId },
                ...(q
                    ? {
                        OR: [
                            { email: { contains: q, mode: 'insensitive' } },
                            { username: { contains: q, mode: 'insensitive' } },
                            { displayName: { contains: q, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            take: 20,
            orderBy: [{ username: 'asc' }, { displayName: 'asc' }],
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map