"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var GameInvitationMapper = /** @class */ (function () {
    function GameInvitationMapper() {
        var _this = this;
        this.UserInvitationMapper = new Map();
        this.Add = function (inviterId, invitedId) {
            _this.UserInvitationMapper.delete(inviterId);
            _this.UserInvitationMapper.set(inviterId, invitedId);
        };
        this.IsInvitationExist = function (invitedId, inviterId) {
            return _this.UserInvitationMapper.get(inviterId) == invitedId;
        };
        this.IsAnyInvitationExist = function (inviterId) {
            return _this.UserInvitationMapper.get(inviterId) != undefined;
        };
        this.Remove = function (inviterId) {
            var invitedId = _this.UserInvitationMapper.get(inviterId);
            if (_this.UserInvitationMapper.delete(inviterId))
                return invitedId;
            else
                return undefined;
        };
    }
    return GameInvitationMapper;
}());
exports.default = new GameInvitationMapper();
//# sourceMappingURL=GameInvitationMapper.js.map