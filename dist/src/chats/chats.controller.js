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
exports.ChatsController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const add_chat_member_dto_1 = require("./dto/add-chat-member.dto");
const create_direct_chat_dto_1 = require("./dto/create-direct-chat.dto");
const create_group_chat_dto_1 = require("./dto/create-group-chat.dto");
const chats_service_1 = require("./chats.service");
let ChatsController = class ChatsController {
    chats;
    constructor(chats) {
        this.chats = chats;
    }
    list(user) {
        return this.chats.list(user.id);
    }
    get(user, chatId) {
        return this.chats.get(chatId, user.id);
    }
    markRead(user, chatId) {
        return this.chats.markRead(chatId, user.id);
    }
    createDirect(user, dto) {
        return this.chats.createDirect(user.id, dto);
    }
    createGroup(user, dto) {
        return this.chats.createGroup(user.id, dto);
    }
    addMember(user, chatId, dto) {
        return this.chats.addMember(chatId, user.id, dto.userId);
    }
    removeMember(user, chatId, userId) {
        return this.chats.removeMember(chatId, user.id, userId);
    }
    deleteGroup(user, chatId) {
        return this.chats.deleteGroup(chatId, user.id);
    }
};
exports.ChatsController = ChatsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':chatId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(':chatId/read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "markRead", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_direct_chat_dto_1.CreateDirectChatDto]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "createDirect", null);
__decorate([
    (0, common_1.Post)('group'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_group_chat_dto_1.CreateGroupChatDto]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "createGroup", null);
__decorate([
    (0, common_1.Post)(':chatId/members'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, add_chat_member_dto_1.AddChatMemberDto]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':chatId/members/:userId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Delete)(':chatId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ChatsController.prototype, "deleteGroup", null);
exports.ChatsController = ChatsController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)('chats'),
    __metadata("design:paramtypes", [chats_service_1.ChatsService])
], ChatsController);
//# sourceMappingURL=chats.controller.js.map