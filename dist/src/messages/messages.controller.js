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
exports.MessagesController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const edit_message_dto_1 = require("./dto/edit-message.dto");
const list_messages_dto_1 = require("./dto/list-messages.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
const messages_service_1 = require("./messages.service");
let MessagesController = class MessagesController {
    messages;
    constructor(messages) {
        this.messages = messages;
    }
    list(user, chatId, query) {
        return this.messages.list(chatId, user.id, query);
    }
    send(user, chatId, dto) {
        return this.messages.send(chatId, user.id, dto);
    }
    edit(user, messageId, dto) {
        return this.messages.edit(messageId, user.id, dto);
    }
    softDelete(user, messageId) {
        return this.messages.softDelete(messageId, user.id);
    }
};
exports.MessagesController = MessagesController;
__decorate([
    (0, common_1.Get)('chats/:chatId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, list_messages_dto_1.ListMessagesDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('chats/:chatId/messages'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, send_message_dto_1.SendMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "send", null);
__decorate([
    (0, common_1.Patch)('messages/:messageId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('messageId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, edit_message_dto_1.EditMessageDto]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "edit", null);
__decorate([
    (0, common_1.Delete)('messages/:messageId'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('messageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], MessagesController.prototype, "softDelete", null);
exports.MessagesController = MessagesController = __decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [messages_service_1.MessagesService])
], MessagesController);
//# sourceMappingURL=messages.controller.js.map