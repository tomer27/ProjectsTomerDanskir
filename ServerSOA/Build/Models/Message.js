"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMessageInstance = void 0;
var CreateMessageInstance = function (sender, reciever, content) {
    var message = {};
    message.sender = sender;
    message.reciever = reciever;
    message.content = content;
    message.sendTime = new Date();
    return message;
};
exports.CreateMessageInstance = CreateMessageInstance;
//# sourceMappingURL=Message.js.map