"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MovementResults = /** @class */ (function () {
    function MovementResults(from, to, isEat, isOut) {
        this.src = 0;
        this.dst = 0;
        this.diceStepPlayed = 0;
        this.isWon = false;
        this.isTurnOver = false; // after the move
        this.src = from;
        this.dst = to;
        this.isEatenOnDst = isEat;
        this.isTookOut = isOut;
    }
    return MovementResults;
}());
exports.default = MovementResults;
//# sourceMappingURL=MovementResults.js.map