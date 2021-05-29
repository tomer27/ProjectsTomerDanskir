"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var MovementResults_1 = __importDefault(require("./MovementResults"));
var Coin_1 = __importDefault(require("./Coin"));
var Consts_1 = require("./Consts");
var DS = /** @class */ (function () {
    function DS() {
        this.board = new Array(24);
        for (var i = 0; i < this.board.length; i++)
            this.board[i] = new Array();
        this.board[0].push(new Coin_1.default(false), new Coin_1.default(false));
        this.board[5].push(new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true));
        this.board[7].push(new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true));
        this.board[11].push(new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false));
        this.board[12].push(new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true), new Coin_1.default(true));
        this.board[16].push(new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false));
        this.board[18].push(new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false), new Coin_1.default(false));
        this.board[23].push(new Coin_1.default(true), new Coin_1.default(true));
    }
    // Check if player is approved to take out coins, no treatment for eaten coins existence
    DS.prototype.IsTimeToTakeOutCoins = function (playerClr) {
        var start, end;
        if (playerClr) {
            start = Consts_1.START_WHITE_END_BLACK_INDEX;
            end = Consts_1.START_BLACK_END_WHITE_INDEX + Consts_1.HOME_AREA_LENGTH;
        }
        else {
            start = Consts_1.START_BLACK_END_WHITE_INDEX;
            end = Consts_1.START_WHITE_END_BLACK_INDEX - Consts_1.HOME_AREA_LENGTH;
        }
        for (var i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (this.board[i].find(function (c) { return c.color === playerClr; }))
                return false;
        }
        return true;
    };
    // Check if can take out coins, based on backgammon logic: by giving whos player and array of steps options
    DS.prototype.IsPossibleTakeOutCoin = function (plarClr, stepsLeft) {
        if (plarClr) {
            //  check straight away coin to take out based on dice results that not have been played
            for (var i = 0; i < stepsLeft.length; i++) {
                if (this.board[stepsLeft[i] - 1].find(function (c) { return c.color === plarClr; }))
                    return true;
            }
            return this.IsPossibleToTakeOutCoinByNotExactSteps(plarClr, stepsLeft);
        }
        else {
            for (var i = 0; i < stepsLeft.length; i++) {
                if (this.board[Consts_1.START_WHITE_END_BLACK_INDEX + 1 - stepsLeft[i]].find(function (c) { return c.color === plarClr; }))
                    return true;
            }
            return this.IsPossibleToTakeOutCoinByNotExactSteps(plarClr, stepsLeft);
        }
    };
    // check speacial case of letting coins out on a step which is different from dice results
    // takes a coin color and array of numbers, checks if there is a coin of this color between the highest value of array
    // as a position in the relative home area to the home area end
    DS.prototype.IsPossibleToTakeOutCoinByNotExactSteps = function (playClr, stepsOption) {
        // take out higher value between the dice results that not have been played
        var maximumValue = stepsOption.length > 1 ? Math.max(stepsOption[0], stepsOption[1]) : stepsOption[0];
        var start, end;
        if (playClr) {
            start = Consts_1.START_BLACK_END_WHITE_INDEX + Consts_1.HOME_AREA_LENGTH - 1;
            end = Consts_1.START_BLACK_END_WHITE_INDEX + maximumValue - 1;
            // check if there are coins positioned higher of maximum value on dices, you cant take out yet
            for (var i = Math.min(start, end); i <= Math.max(start, end); i++) {
                if (this.board[i].find(function (c) { return c.color === playClr; }))
                    return false;
            }
            return true;
        }
        else {
            start = Consts_1.START_WHITE_END_BLACK_INDEX - Consts_1.HOME_AREA_LENGTH + 1;
            end = Consts_1.START_WHITE_END_BLACK_INDEX - maximumValue + 1;
            for (var i = Math.min(start, end); i <= Math.max(start, end); i++) {
                if (this.board[i].find(function (c) { return c.color === playClr; }))
                    return false;
            }
            return true;
        }
    };
    // Check the validation to return eaten coin based on array of options
    DS.prototype.IsPossibleReturnEatenCoin = function (playerClr, stepsLeft) {
        // where the players starting point depands of its color
        var src = playerClr ? Consts_1.START_WHITE_END_BLACK_INDEX + 1 : Consts_1.START_BLACK_END_WHITE_INDEX - 1;
        var foundedOption = false;
        for (var i = 0; i < stepsLeft.length && !foundedOption; i++) {
            foundedOption = this.CheckDstValid(this.ReturnDstByPlayersDirection(src, stepsLeft[i], playerClr), playerClr);
        }
        return foundedOption;
    };
    // Check destination is valid to land on: by giving dst position and whos player
    // remark: approves dst as 'taking out' index => no further check if llegal to take out
    DS.prototype.CheckDstValid = function (dst, clr) {
        //dst should be between board borders
        if (dst < Consts_1.START_BLACK_END_WHITE_INDEX - 1 ||
            dst > Consts_1.START_WHITE_END_BLACK_INDEX + 1)
            return false;
        if (dst === Consts_1.START_BLACK_END_WHITE_INDEX - 1 ||
            dst === Consts_1.START_WHITE_END_BLACK_INDEX + 1)
            return true;
        var dstCol = this.board[dst];
        //if dst includes similar coins or    if dst have 1 coin (even of other player - eating) or empty
        if (dstCol.find(function (c) { return c.color === clr; }) || dstCol.length <= 1)
            return true;
        else
            return false;
    };
    // Check if there is an option to make a move: by giving whos player and array of steps options
    DS.prototype.IsPossibleMakeARegularMove = function (playerClr, stepsLeft) {
        for (var i = Consts_1.START_BLACK_END_WHITE_INDEX; i <= Consts_1.START_WHITE_END_BLACK_INDEX; i++) {
            // if its the players coin
            if (this.board[i].find(function (c) { return c.color === playerClr; })) {
                // checking if there is valid option to move based on any of dice results
                for (var j = 0; j < stepsLeft.length; j++) {
                    if (this.CheckDstValid(this.ReturnDstByPlayersDirection(i, stepsLeft[j], playerClr), playerClr))
                        return true;
                }
            }
        }
        //checked all player coins and didnt find a valid move
        return false;
    };
    // Returns the dst by sum or reduce values, based on whos player and his movement diretion
    DS.prototype.ReturnDstByPlayersDirection = function (src, numOfSteps, playerClr) {
        if (playerClr)
            return src - numOfSteps;
        else
            return src + numOfSteps;
    };
    DS.prototype.MakeAMove = function (coinClr, src, dst, playerEatenSrcCoin) {
        var movingCoin;
        var rivalEatedCoin;
        var playersCoinWhichTakenOut;
        // dst not takan
        if (this.CheckDstValid(dst, coinClr)) {
            //  src is one of the columns on board
            if (src <= Consts_1.START_WHITE_END_BLACK_INDEX &&
                src >= Consts_1.START_BLACK_END_WHITE_INDEX) {
                movingCoin = this.board[src].pop();
            }
            // src is players eaten coin that about to enter the board
            else {
                movingCoin = playerEatenSrcCoin;
            }
            //  dst is one of the columns on board
            if (dst <= Consts_1.START_WHITE_END_BLACK_INDEX &&
                dst >= Consts_1.START_BLACK_END_WHITE_INDEX) {
                //check if on dst there isnt a rival's coin
                if (!this.board[dst].find(function (c) { return c.color !== coinClr; })) {
                    this.board[dst].push(movingCoin);
                }
                // but if there is a rival's coin there, poping out rivals and pushing players coin
                else {
                    rivalEatedCoin = this.board[dst].pop();
                    this.board[dst].push(movingCoin);
                }
            }
            // if coin is about to take out of the game
            else {
                playersCoinWhichTakenOut = movingCoin;
            }
            return new MovementResults_1.default(src, dst, rivalEatedCoin, playersCoinWhichTakenOut);
        }
        else {
            return false;
        }
    };
    return DS;
}());
exports.default = DS;
//# sourceMappingURL=DS.js.map