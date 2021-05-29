import MovementResults from './MovementResults'
import Coin from './Coin'
import { START_BLACK_END_WHITE_INDEX, START_WHITE_END_BLACK_INDEX, HOME_AREA_LENGTH } from './Consts'

class DS {
    board: Array<Array<Coin>> = new Array<Array<Coin>>(24)
    constructor() {
        for (let i = 0; i < this.board.length; i++)
            this.board[i] = new Array<Coin>()
            
        this.board[0].push(new Coin(false), new Coin(false))
        this.board[5].push(
            new Coin(true),
            new Coin(true),
            new Coin(true),
            new Coin(true),
            new Coin(true),
        )
        this.board[7].push(new Coin(true), new Coin(true), new Coin(true))

        this.board[11].push(
            new Coin(false),
            new Coin(false),
            new Coin(false),
            new Coin(false),
            new Coin(false),
        )
        this.board[12].push(
            new Coin(true),
            new Coin(true),
            new Coin(true),
            new Coin(true),
            new Coin(true),
        )
        this.board[16].push(new Coin(false), new Coin(false), new Coin(false))

        this.board[18].push(
            new Coin(false),
            new Coin(false),
            new Coin(false),
            new Coin(false),
            new Coin(false),
        )

        this.board[23].push(new Coin(true), new Coin(true))
    }

    // Check if player is approved to take out coins, no treatment for eaten coins existence
    IsTimeToTakeOutCoins(playerClr: boolean): boolean {
        let start, end
        if (playerClr) {
            start = START_WHITE_END_BLACK_INDEX
            end = START_BLACK_END_WHITE_INDEX + HOME_AREA_LENGTH
        } else {
            start = START_BLACK_END_WHITE_INDEX
            end = START_WHITE_END_BLACK_INDEX - HOME_AREA_LENGTH
        }

        for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (this.board[i].find((c) => c.color === playerClr)) return false
        }
        return true
    }

    // Check if can take out coins, based on backgammon logic: by giving whos player and array of steps options
    IsPossibleTakeOutCoin(plarClr: boolean, stepsLeft: number[]): boolean {
        if (plarClr) {
            //  check straight away coin to take out based on dice results that not have been played
            for (let i = 0; i < stepsLeft.length; i++) {
                if (this.board[stepsLeft[i] - 1].find((c) => c.color === plarClr))
                    return true
            }
            return this.IsPossibleToTakeOutCoinByNotExactSteps(plarClr, stepsLeft)
        } else {
            for (let i = 0; i < stepsLeft.length; i++) {
                if (this.board[START_WHITE_END_BLACK_INDEX + 1 - stepsLeft[i]].find((c) => c.color === plarClr)
                )
                    return true
            }
            return this.IsPossibleToTakeOutCoinByNotExactSteps(plarClr, stepsLeft)
        }
    }

    // check speacial case of letting coins out on a step which is different from dice results
    // takes a coin color and array of numbers, checks if there is a coin of this color between the highest value of array
    // as a position in the relative home area to the home area end
    IsPossibleToTakeOutCoinByNotExactSteps(playClr: boolean, stepsOption: Array<number>): boolean {
        // take out higher value between the dice results that not have been played
        let maximumValue = stepsOption.length > 1 ? Math.max(stepsOption[0], stepsOption[1]) : stepsOption[0]
        let start, end
        if (playClr) {
            start = START_BLACK_END_WHITE_INDEX + HOME_AREA_LENGTH - 1
            end = START_BLACK_END_WHITE_INDEX + maximumValue - 1
            // check if there are coins positioned higher of maximum value on dices, you cant take out yet
            for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                if (this.board[i].find((c) => c.color === playClr)) return false
            }
            return true
        } else {
            start = START_WHITE_END_BLACK_INDEX - HOME_AREA_LENGTH + 1
            end = START_WHITE_END_BLACK_INDEX - maximumValue + 1
            for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
                if (this.board[i].find((c) => c.color === playClr)) return false
            }
            return true
        }
    }

    // Check the validation to return eaten coin based on array of options
    IsPossibleReturnEatenCoin(playerClr: boolean, stepsLeft: number[]): boolean {
        // where the players starting point depands of its color
        const src = playerClr ? START_WHITE_END_BLACK_INDEX + 1 : START_BLACK_END_WHITE_INDEX - 1
        let foundedOption = false
        for (let i = 0; i < stepsLeft.length && !foundedOption; i++) {
            foundedOption = this.CheckDstValid(this.ReturnDstByPlayersDirection(src, stepsLeft[i], playerClr), playerClr)
        }
        return foundedOption
    }

    // Check destination is valid to land on: by giving dst position and whos player
    // remark: approves dst as 'taking out' index => no further check if llegal to take out
    CheckDstValid(dst: number, clr: boolean): boolean {
        //dst should be between board borders
        if (
            dst < START_BLACK_END_WHITE_INDEX - 1 ||
            dst > START_WHITE_END_BLACK_INDEX + 1
        )
            return false
        if (
            dst === START_BLACK_END_WHITE_INDEX - 1 ||
            dst === START_WHITE_END_BLACK_INDEX + 1
        )
            return true
        let dstCol = this.board[dst]
        //if dst includes similar coins or    if dst have 1 coin (even of other player - eating) or empty
        if (dstCol.find((c) => c.color === clr) || dstCol.length <= 1) return true
        else return false
    }

    // Check if there is an option to make a move: by giving whos player and array of steps options
    IsPossibleMakeARegularMove(playerClr: boolean, stepsLeft: number[]): boolean {
        for (
            let i = START_BLACK_END_WHITE_INDEX;
            i <= START_WHITE_END_BLACK_INDEX;
            i++
        ) {
            // if its the players coin
            if (this.board[i].find((c) => c.color === playerClr)) {
                // checking if there is valid option to move based on any of dice results
                for (let j = 0; j < stepsLeft.length; j++) {
                    if (
                        this.CheckDstValid(
                            this.ReturnDstByPlayersDirection(i, stepsLeft[j], playerClr),
                            playerClr,
                        )
                    )
                        return true
                }
            }
        }
        //checked all player coins and didnt find a valid move
        return false
    }

    // Returns the dst by sum or reduce values, based on whos player and his movement diretion
    ReturnDstByPlayersDirection(
        src: number,
        numOfSteps: number,
        playerClr: boolean,
    ): number {
        if (playerClr) return src - numOfSteps
        else return src + numOfSteps
    }

    MakeAMove(
        coinClr: boolean,
        src: number,
        dst: number,
        playerEatenSrcCoin: Coin | undefined,
    ): boolean | MovementResults {
        let movingCoin: Coin | undefined
        let rivalEatedCoin: Coin | undefined
        let playersCoinWhichTakenOut: Coin | undefined
        // dst not takan
        if (this.CheckDstValid(dst, coinClr)) {
            //  src is one of the columns on board
            if (
                src <= START_WHITE_END_BLACK_INDEX &&
                src >= START_BLACK_END_WHITE_INDEX
            ) {
                movingCoin = this.board[src].pop()
            }
            // src is players eaten coin that about to enter the board
            else {
                movingCoin = playerEatenSrcCoin as Coin
            }

            //  dst is one of the columns on board
            if (
                dst <= START_WHITE_END_BLACK_INDEX &&
                dst >= START_BLACK_END_WHITE_INDEX
            ) {
                //check if on dst there isnt a rival's coin
                if (!this.board[dst].find((c) => c.color !== coinClr)) {
                    this.board[dst].push(movingCoin as Coin)
                }
                // but if there is a rival's coin there, poping out rivals and pushing players coin
                else {
                    rivalEatedCoin = this.board[dst].pop() as Coin
                    this.board[dst].push(movingCoin as Coin)
                }
            }
            // if coin is about to take out of the game
            else {
                playersCoinWhichTakenOut = movingCoin as Coin
            }

            return new MovementResults(
                src,
                dst,
                rivalEatedCoin,
                playersCoinWhichTakenOut,
            )
        } else {
            return false
        }
    }
}
export default DS