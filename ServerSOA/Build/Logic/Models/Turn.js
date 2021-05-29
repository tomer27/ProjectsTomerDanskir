"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Turn = /** @class */ (function () {
    function Turn(player) {
        this.whosTurn = player;
    }
    Turn.prototype.InitTurn = function (dicesRes) {
        this.stepsLeft = dicesRes;
        if (this.IsDouble())
            this.stepsLeft = dicesRes.concat(dicesRes);
        this.movementsLeftCounter = this.IsDouble() ? 4 : 2;
    };
    Turn.prototype.UpdateTurn = function (stepPlayed) {
        var diceResultPlayed;
        this.movementsLeftCounter--;
        //if stepped by dice
        if (this.stepsLeft.includes(stepPlayed)) {
            diceResultPlayed = stepPlayed;
            console.log("played if1: " + diceResultPlayed);
            // if is not a double
            if (this.stepsLeft.some(function (n) { return n !== stepPlayed; })) {
                this.stepsLeft = this.stepsLeft.filter(function (n) { return n !== stepPlayed; });
            }
            else {
                this.stepsLeft.pop();
            }
        }
        else {
            // if is not a double
            if (this.stepsLeft.some(function (n) { return n !== stepPlayed; })) {
                //poping the bigger value - this is the "step" that has been made
                var biggerElement_1 = Math.max(this.stepsLeft[0], this.stepsLeft[1]);
                diceResultPlayed = biggerElement_1;
                console.log("played if2: " + diceResultPlayed);
                this.stepsLeft = this.stepsLeft.filter(function (n) { return n !== biggerElement_1; });
            }
            else {
                diceResultPlayed = this.stepsLeft[0];
                console.log("played else: " + diceResultPlayed);
                this.stepsLeft.pop();
            }
        }
        return diceResultPlayed;
    };
    Turn.prototype.IsDouble = function () {
        return this.stepsLeft[0] === this.stepsLeft[1];
    };
    return Turn;
}());
exports.default = Turn;
//# sourceMappingURL=Turn.js.map