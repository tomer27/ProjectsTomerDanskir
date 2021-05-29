"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var SocketUserMapper = /** @class */ (function () {
    function SocketUserMapper() {
        var _this = this;
        this.socketUser = new Map();
        this.userSocket = new Map();
        this.Add = function (userId, socketId) {
            if (_this.userSocket.get(userId) != undefined) {
                _this.RemoveByUserId(userId);
            }
            _this.socketUser.set(socketId, userId);
            _this.userSocket.set(userId, socketId);
        };
        this.RemoveByUserId = function (userId) {
            var socketId = _this.userSocket.get(userId);
            if (socketId === undefined)
                throw new Error("socket of user " + userId + " doesn't exist");
            _this.userSocket.delete(userId);
            _this.socketUser.delete(socketId);
        };
        this.RemoveBySocketId = function (socketId) {
            var userId = _this.socketUser.get(socketId);
            if (socketId === undefined)
                throw new Error("socket " + socketId + " doesn't exist");
            _this.socketUser.delete(socketId);
            _this.userSocket.delete(userId);
        };
        this.GetSocketIdByUserId = function (userId) {
            var socketId = _this.userSocket.get(userId);
            return socketId;
        };
        this.GetUserIdBySocketId = function (socketId) {
            var userId = _this.socketUser.get(socketId);
            if (socketId === undefined)
                throw new Error("socket " + socketId + " doesn't exist");
            else
                return userId;
        };
    }
    return SocketUserMapper;
}());
exports.default = new SocketUserMapper();
//# sourceMappingURL=SocketUserMapper.js.map