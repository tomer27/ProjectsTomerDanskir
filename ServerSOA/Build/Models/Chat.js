"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateChatInstance = void 0;
var CreateChatInstance = function (member1, member2) {
    var chat = {};
    chat.messages = [];
    chat.members = [member1, member2];
    return chat;
};
exports.CreateChatInstance = CreateChatInstance;
//# sourceMappingURL=Chat.js.map