"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorResult;
(function (ErrorResult) {
    ErrorResult[ErrorResult["UsernameLength"] = 0] = "UsernameLength";
    ErrorResult[ErrorResult["EmailInvalid"] = 1] = "EmailInvalid";
    ErrorResult[ErrorResult["PasswordLength"] = 2] = "PasswordLength";
    ErrorResult[ErrorResult["UsernameAlreadyInUse"] = 3] = "UsernameAlreadyInUse";
    ErrorResult[ErrorResult["EmailIsAlreadyInUse"] = 4] = "EmailIsAlreadyInUse";
    ErrorResult[ErrorResult["UnknownError"] = 5] = "UnknownError";
})(ErrorResult || (ErrorResult = {}));
exports.default = ErrorResult;
//# sourceMappingURL=ErrorResult.js.map