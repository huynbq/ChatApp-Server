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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const auth_guard_1 = require("../auth/auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const messages_service_1 = require("../messages/messages.service");
const storage_service_1 = require("./storage.service");
let StorageController = class StorageController {
    storage;
    messages;
    constructor(storage, messages) {
        this.storage = storage;
        this.messages = messages;
    }
    async attachToMessage(user, messageId, file) {
        const { chatId } = await this.messages.getAttachmentTarget(messageId, user.id);
        const uploaded = await this.storage.uploadPhoto(user.token, chatId, messageId, file);
        return this.messages.addAttachment(messageId, user.id, uploaded);
    }
    async createPhotoMessage(user, chatId, file, content, replyToMessageId, mentionUserIds) {
        const message = await this.messages.createPhotoMessage(chatId, user.id, content, replyToMessageId, this.parseMentionUserIds(mentionUserIds));
        const uploaded = await this.storage.uploadPhoto(user.token, chatId, message.id, file);
        return this.messages.addAttachment(message.id, user.id, uploaded);
    }
    parseMentionUserIds(value) {
        if (!value)
            return [];
        return value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('messages/:messageId/attachments'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "attachToMessage", null);
__decorate([
    (0, common_1.Post)('chats/:chatId/messages/photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo')),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Body)('content')),
    __param(4, (0, common_1.Body)('replyToMessageId')),
    __param(5, (0, common_1.Body)('mentionUserIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "createPhotoMessage", null);
exports.StorageController = StorageController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [storage_service_1.StorageService,
        messages_service_1.MessagesService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map