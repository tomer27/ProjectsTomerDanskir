"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.passport = exports.sessionMiddleware = exports.http = void 0;
var express_1 = __importDefault(require("express"));
var session = require("express-session");
var passport = require("passport");
exports.passport = passport;
var app = express_1.default();
var cors = require('cors');
var server_basic_configurations_1 = __importDefault(require("./server-basic-configurations"));
var authenticationController_1 = __importDefault(require("./Controllers/authenticationController"));
var authentication_1 = __importDefault(require("./Authentication/authentication"));
var usersController_1 = __importDefault(require("./Controllers/usersController"));
var MongooseConnection_1 = require("./DB/DBInstance/MongooseConnection");
app.set("port", process.env.PORT || server_basic_configurations_1.default.port);
var corsOptions = {
    origin: server_basic_configurations_1.default.clientUrl,
    credentials: true
};
app.use(cors(corsOptions));
app.use('/static', express_1.default.static('Build/StaticFiles'));
var sessionMiddleware = session({ secret: "sessionsecret", resave: false, saveUninitialized: false });
exports.sessionMiddleware = sessionMiddleware;
app.use(sessionMiddleware);
app.use(express_1.default.json());
app.use(passport.initialize());
app.use(passport.session());
var http = require("http").Server(app);
exports.http = http;
app.use(function (req, res, next) {
    console.log('>>> new request recieved');
    next();
});
app.use(authentication_1.default);
app.use(authenticationController_1.default);
app.use(usersController_1.default);
http.listen(process.env.PORT || server_basic_configurations_1.default.port, function () {
    console.log(">>> listening on port " + server_basic_configurations_1.default.port);
    InitializeWebSocket();
});
var InitializeWebSocket = function () { return __awaiter(void 0, void 0, void 0, function () {
    var io, LoadWebSocketFunctions;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, MongooseConnection_1.ConnectMongoDB()];
            case 1:
                _a.sent();
                io = require('./Socket/webSocket');
                LoadWebSocketFunctions = require('./Socket/socketController');
                LoadWebSocketFunctions();
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=index.js.map