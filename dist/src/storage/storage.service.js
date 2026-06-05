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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto_1 = require("crypto");
const supabase_service_1 = require("../supabase/supabase.service");
let StorageService = class StorageService {
    config;
    supabase;
    bucket;
    constructor(config, supabase) {
        this.config = config;
        this.supabase = supabase;
        this.bucket = this.config.get('SUPABASE_STORAGE_BUCKET') ?? 'chat-photos';
    }
    async uploadPhoto(token, chatId, messageId, file) {
        if (!file)
            throw new common_1.BadRequestException('Photo file is required');
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Only image uploads are supported');
        }
        const extension = this.extensionFromMime(file.mimetype);
        const path = `${chatId}/${messageId}/${(0, crypto_1.randomUUID)()}${extension}`;
        const client = this.supabase.createUserClient(token);
        const { error } = await client.storage
            .from(this.bucket)
            .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error)
            throw new common_1.BadRequestException(error.message);
        return {
            bucket: this.bucket,
            path,
            mimeType: file.mimetype,
            sizeBytes: file.size,
        };
    }
    extensionFromMime(mimeType) {
        const map = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
        };
        return map[mimeType] ?? '';
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        supabase_service_1.SupabaseService])
], StorageService);
//# sourceMappingURL=storage.service.js.map