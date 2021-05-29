"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
var server_basic_configurations_1 = __importDefault(require("../server-basic-configurations"));
var io = require("socket.io")(index_1.http, {
    cors: {
        origin: server_basic_configurations_1.default.clientUrl,
        methods: ["GET", "POST"],
        credentials: true
    }
});
// @ts-ignore: Unreachable code error
var wrap = function (middleware) { return function (socket, next) { return middleware(socket.request, {}, next); }; };
io.use(wrap(index_1.sessionMiddleware));
io.use(wrap(index_1.passport.initialize()));
io.use(wrap(index_1.passport.session()));
// @ts-ignore: Unreachable code error
io.use(function (socket, next) {
    if (socket.request.user) {
        next();
    }
    else {
        next(new Error('unauthorized'));
    }
});
exports.default = io;
//# sourceMappingURL=webSocket.js.map