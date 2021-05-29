"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = __importDefault(require("./Models/Player"));
var Consts_1 = require("./Models/Consts");
var DS_1 = __importDefault(require("./Models/DS"));
var Turn_1 = __importDefault(require("./Models/Turn"));
var PreGame_1 = __importDefault(require("./Models/PreGame"));
var Logic = /** @class */ (function () {
    function Logic() {
        this.isGameOver = false;
        this.ds = new DS_1.default();
        this.players = new Array(new Player_1.default(true), new Player_1.default(false));
    }
    Logic.prototype.ReinitializePreGame = function () {
        this.preGame = undefined;
    };
    //endpoints:
    // Endpoint
    // to decide who starts
    Logic.prototype.HandleThrowOneDice = function (color) {
        if (this.preGame == undefined) {
            this.preGame = new PreGame_1.default(color, Math.floor(Math.random() * 6 + 1));
            return this.preGame.cube;
        }
        else {
            var number = Math.floor(Math.random() * 6 + 1);
            if (this.preGame.player)
                this.preGame.whoStarts = this.HandleWhoStarts(this.preGame.cube, number);
            else
                this.preGame.whoStarts = this.HandleWhoStarts(number, this.preGame.cube);
            return number;
        }
    };
    // Endpoint
    //returns 1/2/0 for who starts, 0 for no-decision
    //p1 is always white, p2 is always black
    Logic.prototype.HandleWhoStarts = function (p1, p2) {
        if (p1 > p2) {
            this.currentTurn = new Turn_1.default(true);
            return 1;
        }
        else if (p2 > p1) {
            this.currentTurn = new Turn_1.default(false);
            return 2;
        }
        else
            return 0;
    };
    // Endpoint
    // Rolling 2 numbers, checking if can make a move
    Logic.prototype.HandleThrowTwoDices = function () {
        this.currentTurn.InitTurn(this.rollingDices());
        return this.currentTurn.stepsLeft;
    };
    // Endpoint
    // Check the ability to make a move based on current turn, giving yes/no answer
    Logic.prototype.HandleCheckAbilityToPlayByDices = function () {
        var answer;
        // if there is an eaten
        if (this.DoesPlayerHasEatenCoins(this.currentTurn.whosTurn)) {
            // checking if one of dices numbers are good to enter an eaten coin
            answer = this.ds.IsPossibleReturnEatenCoin(this.currentTurn.whosTurn, this.currentTurn.stepsLeft);
        }
        // if its the taking coins out time
        else if (this.ds.IsTimeToTakeOutCoins(this.currentTurn.whosTurn)) {
            // if its the game-time to take out coins,
            // still may be no option to take out coins - based on dice results and coins position
            // on this case, we will check for regular movement inside the home area
            answer =
                this.ds.IsPossibleTakeOutCoin(this.currentTurn.whosTurn, this.currentTurn.stepsLeft) ||
                    this.ds.IsPossibleMakeARegularMove(this.currentTurn.whosTurn, this.currentTurn.stepsLeft);
        }
        // regular movement check
        else {
            answer = this.ds.IsPossibleMakeARegularMove(this.currentTurn.whosTurn, this.currentTurn.stepsLeft);
        }
        // initiates turn
        if (!answer)
            this.currentTurn = new Turn_1.default(!this.currentTurn.whosTurn);
        return answer;
    };
    Logic.prototype.IsMoveLegalByDices = function (src, dst) {
        return this.currentTurn.stepsLeft.includes(Math.abs(dst - src));
    };
    //Endpoint
    // Try To make user's move, return failure or MovementResults object
    Logic.prototype.HandleMove = function (src, dst) {
        var _a, _b;
        var resultOfMove;
        var coinClr;
        // src / dst out of range
        if (src < Consts_1.START_BLACK_END_WHITE_INDEX - 1 || src > Consts_1.START_WHITE_END_BLACK_INDEX + 1 ||
            dst < Consts_1.START_BLACK_END_WHITE_INDEX - 1 || dst > Consts_1.START_WHITE_END_BLACK_INDEX + 1) {
            return false;
        }
        // declaring coinClr based on whos turn in case of returning eated coin
        if (src === Consts_1.START_BLACK_END_WHITE_INDEX - 1 || src === Consts_1.START_WHITE_END_BLACK_INDEX + 1) {
            coinClr = this.currentTurn.whosTurn;
            //check if the user realy have eaten coins
            if (((_a = this.players.find(function (p) { return p.coinColor === coinClr; })) === null || _a === void 0 ? void 0 : _a.eatenCoins.length) === 0)
                return false;
        }
        else {
            //check if there are coins on src
            if (this.ds.board[src].length === 0)
                return false;
            else
                coinClr = this.ds.board[src][0].color;
        }
        // checks: if not played with a coin of its own, if not played the right direction, 
        // if not played according to the dice results , or not according to results BUT STILL ALLOWED under very specific case of taking out coin under special case
        var isSpecialLowAllowed = this.ds.IsPossibleToTakeOutCoinByNotExactSteps(coinClr, this.currentTurn.stepsLeft);
        var arr = new Array();
        var value = Math.abs(src - dst);
        value = value + 1;
        arr.push(value);
        var isTheRightCoinToMoveBySpecialLow = this.ds.IsPossibleToTakeOutCoinByNotExactSteps(coinClr, arr);
        var isStepByDices = this.IsMoveLegalByDices(src, dst);
        if (this.currentTurn.whosTurn !== coinClr ||
            !this.IsRightDirectionPlayed(src, dst, coinClr) ||
            (!isStepByDices &&
                (!this.ds.IsTimeToTakeOutCoins(coinClr) ||
                    (dst !== Consts_1.START_WHITE_END_BLACK_INDEX + 1 && dst !== Consts_1.START_BLACK_END_WHITE_INDEX - 1) ||
                    !(isSpecialLowAllowed && isTheRightCoinToMoveBySpecialLow)))) {
            return false;
        }
        // check if a moved asked clashes with "eated coins" rules
        else if (this.DoesPlayerHasEatenCoins(coinClr)) {
            // trys to play ignoring his eaten coins
            if (src !== Consts_1.START_WHITE_END_BLACK_INDEX + 1 &&
                src !== Consts_1.START_BLACK_END_WHITE_INDEX - 1)
                return false;
            // trys to enter an eaten coin to the game
            else {
                resultOfMove =
                    this.ds.MakeAMove(coinClr, src, dst, (_b = this.players.find(function (p) { return p.coinColor === coinClr; })) === null || _b === void 0 ? void 0 : _b.eatenCoins.pop());
                //tried to enter coin to non-valid position
                if (resultOfMove === false)
                    return false;
                //move worked out
                else {
                    return this.UpdateLogicByMovementConclusions(resultOfMove);
                }
            }
        }
        // check if he tries to take out coins
        else if (dst === Consts_1.START_WHITE_END_BLACK_INDEX + 1 ||
            dst === Consts_1.START_BLACK_END_WHITE_INDEX - 1) {
            // check if he is allowed to take out coins
            if (!this.ds.IsTimeToTakeOutCoins(coinClr)) {
                return false;
            }
            else {
                resultOfMove = this.ds.MakeAMove(coinClr, src, dst, undefined);
                if (resultOfMove === false)
                    return false;
                else {
                    return this.UpdateLogicByMovementConclusions(resultOfMove);
                }
            }
        }
        // regular movement option : into the board borders, no eaten coins return or taking out one
        else {
            resultOfMove = this.ds.MakeAMove(coinClr, src, dst, undefined);
            if (resultOfMove === false)
                return false;
            else {
                return this.UpdateLogicByMovementConclusions(resultOfMove);
            }
        }
    };
    // updates turn, players data and winner status
    Logic.prototype.UpdateLogicByMovementConclusions = function (resultOfMove) {
        var _this = this;
        var _a, _b, _c;
        resultOfMove = resultOfMove;
        // if rival got coin eated, pushing it to its array of eaten
        if (resultOfMove.isEatenOnDst) {
            (_a = this.players.find(function (p) { return p.coinColor === !_this.currentTurn.whosTurn; })) === null || _a === void 0 ? void 0 : _a.eatenCoins.push(resultOfMove.isEatenOnDst);
        }
        // if players took a coin out, and check if he won
        if (resultOfMove.isTookOut) {
            (_b = this.players.find(function (p) { return p.coinColor === _this.currentTurn.whosTurn; })) === null || _b === void 0 ? void 0 : _b.outerCoins.push(resultOfMove.isTookOut);
            // if it was it last coin
            if (((_c = this.players.find(function (p) { return p.coinColor === _this.currentTurn.whosTurn; })) === null || _c === void 0 ? void 0 : _c.outerCoins.length) === Consts_1.MAX_COINS_OUT) {
                resultOfMove.isWon = this.players.find(function (p) { return p.coinColor === _this.currentTurn.whosTurn; });
                this.winner = resultOfMove.isWon;
                this.isGameOver = true;
                resultOfMove.isTurnOver = true;
            }
        }
        //update turn
        var number = this.currentTurn.UpdateTurn(Math.abs(resultOfMove.dst - resultOfMove.src));
        resultOfMove.diceStepPlayed = number;
        if (this.currentTurn.movementsLeftCounter === 0) {
            this.currentTurn = new Turn_1.default(!this.currentTurn.whosTurn);
            resultOfMove.isTurnOver = true;
        }
        console.log(resultOfMove);
        return resultOfMove;
    };
    // check if player played in his direction of play, includes checking if src & dst not the same
    Logic.prototype.IsRightDirectionPlayed = function (src, dst, coinClr) {
        if (coinClr)
            return dst < src;
        else
            return dst > src;
    };
    // checks if specific player has eaten coins
    Logic.prototype.DoesPlayerHasEatenCoins = function (whosTurn) {
        var _a;
        return (((_a = this.players.find(function (p) { return p.coinColor === whosTurn; })) === null || _a === void 0 ? void 0 : _a.eatenCoins.length) !== 0);
    };
    // Random 2 numbers return as an array
    Logic.prototype.rollingDices = function () {
        var list = [
            Math.floor(Math.random() * 6 + 1),
            Math.floor(Math.random() * 6 + 1)
        ];
        return list;
    };
    return Logic;
}());
exports.default = Logic;
// let bl = new Logic();
// Checking Section
// do {
//   var num1 = bl.HandleThrowOneDice()
//   var num2 = bl.HandleThrowOneDice()
// } while (num1 === num2)
// console.log(num1 + " " + num2)
// console.log(bl.HandleWhoStarts(num1, num2));
// console.log(bl.HandleThrowTwoDices())
// console.log(bl.HandleCheckAbilityToPlayByDices())
// debugger;
// bl.currentTurn = new Turn(false);
// bl.currentTurn.movementsLeftCounter = 1;
// bl.currentTurn.stepsLeft = new Array<number>()
// bl.currentTurn.stepsLeft = [6]
// adding eaten coin: 
// bl.players.find(p => p.coinColor === true)?.eatenCoins.push(new Coin(true))
// bl.ds.board = new Array<Array<Coin>>(24);
// for (let i = 0; i < bl.ds.board.length; i++)
//   bl.ds.board[i] = new Array<Coin>()
// bl.ds.board[19].push(new Coin(false));
// bl.ds.board[20].push(new Coin(false));
// bl.ds.board[22].push(new Coin(false), new Coin(false));
// bl.ds.board[11].push(new Coin(false));
// bl.ds.board[7          ].push(new Coin(true))
// bl.ds.board[12].push(new Coin(false), new Coin(false));
// bl.ds.board[13].push(new Coin(true))
// answer
// console.log(`Can I go with ${bl.currentTurn.stepsLeft}?: ${bl.HandleCheckAbilityToPlayByDices()}`)
// var res = bl.HandleMove(23,22)
// var res = bl.HandleCheckAbilityToPlayByDices();
// console.log(res);
// debugger;
//# sourceMappingURL=logic.js.map