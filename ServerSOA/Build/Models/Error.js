"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestError;
(function (RequestError) {
    RequestError[RequestError["UsernameLength"] = 0] = "UsernameLength";
    RequestError[RequestError["EmailInvalid"] = 1] = "EmailInvalid";
    RequestError[RequestError["PasswordLength"] = 2] = "PasswordLength";
})(RequestError || (RequestError = {}));
exports.default = RequestError;
//# sourceMappingURL=Error.js.map