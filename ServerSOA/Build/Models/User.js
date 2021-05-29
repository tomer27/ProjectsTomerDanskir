"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserInstance = void 0;
var CreateUserInstance = function (username, email, hashedPassword) {
    var user = {};
    user.username = username;
    user.email = email;
    user.password = hashedPassword;
    user.joinedAt = new Date();
    return user;
};
exports.CreateUserInstance = CreateUserInstance;
//# sourceMappingURL=User.js.map