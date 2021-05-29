import Coin from './Models/Coin'
import MovementResults from './Models/MovementResults'
import Player from './Models/Player'
import { START_BLACK_END_WHITE_INDEX, START_WHITE_END_BLACK_INDEX, MAX_COINS_OUT } from './Models/Consts'
import DS from './Models/DS'
import Turn from './Models/Turn'
import PreGame from './Models/PreGame';

class Logic {
  preGame!: PreGame | undefined
  ds!: DS
  isGameOver: boolean = false
  players!: Array<Player>
  currentTurn!: Turn
  winner!: Player
  constructor() {
    this.ds = new DS()
    this.players = new Array<Player>(new Player(true), new Player(false))
  }

  ReinitializePreGame(): void {
    this.preGame = undefined;
  }

  //endpoints:
  // Endpoint
  // to decide who starts
  HandleThrowOneDice(color: boolean): number {
    if (this.preGame == undefined) {
      this.preGame = new PreGame(color, Math.floor(Math.random() * 6 + 1));
      return this.preGame.cube;
    } else {
      const number = Math.floor(Math.random() * 6 + 1);
      if (this.preGame.player)
        this.preGame.whoStarts = this.HandleWhoStarts(this.preGame.cube, number);
      else
        this.preGame.whoStarts = this.HandleWhoStarts(number, this.preGame.cube);

      return number;
    }
  }

  // Endpoint
  //returns 1/2/0 for who starts, 0 for no-decision
  //p1 is always white, p2 is always black
  HandleWhoStarts(p1: number, p2: number): number {
    if (p1 > p2) {
      this.currentTurn = new Turn(true)
      return 1
    } else if (p2 > p1) {
      this.currentTurn = new Turn(false)
      return 2
    } else return 0
  }

  // Endpoint
  // Rolling 2 numbers, checking if can make a move
  HandleThrowTwoDices(): number[] {
    this.currentTurn.InitTurn(this.rollingDices())
    return this.currentTurn.stepsLeft
  }

  // Endpoint
  // Check the ability to make a move based on current turn, giving yes/no answer
  HandleCheckAbilityToPlayByDices(): boolean {
    var answer
    // if there is an eaten
    if (this.DoesPlayerHasEatenCoins(this.currentTurn.whosTurn)) {
      // checking if one of dices numbers are good to enter an eaten coin
      answer = this.ds.IsPossibleReturnEatenCoin(
        this.currentTurn.whosTurn,
        this.currentTurn.stepsLeft,
      )
    }
    // if its the taking coins out time
    else if (this.ds.IsTimeToTakeOutCoins(this.currentTurn.whosTurn)) {
      // if its the game-time to take out coins,
      // still may be no option to take out coins - based on dice results and coins position
      // on this case, we will check for regular movement inside the home area
      answer =
        this.ds.IsPossibleTakeOutCoin(
          this.currentTurn.whosTurn,
          this.currentTurn.stepsLeft,
        ) ||
        this.ds.IsPossibleMakeARegularMove(
          this.currentTurn.whosTurn,
          this.currentTurn.stepsLeft,
        )
    }
    // regular movement check
    else {
      answer = this.ds.IsPossibleMakeARegularMove(
        this.currentTurn.whosTurn,
        this.currentTurn.stepsLeft,
      )
    }

    // initiates turn
    if (!answer) this.currentTurn = new Turn(!this.currentTurn.whosTurn)
    return answer
  }

  IsMoveLegalByDices(src: number, dst: number): boolean {
    return this.currentTurn.stepsLeft.includes(Math.abs(dst - src));
  }

  //Endpoint
  // Try To make user's move, return failure or MovementResults object
  HandleMove(
    src: number,
    dst: number,
  ): boolean | MovementResults {
    let resultOfMove;
    let coinClr: boolean;
    // src / dst out of range
    if (src < START_BLACK_END_WHITE_INDEX - 1 || src > START_WHITE_END_BLACK_INDEX + 1 ||
      dst < START_BLACK_END_WHITE_INDEX - 1 || dst > START_WHITE_END_BLACK_INDEX + 1) {
      return false;
    }
    // declaring coinClr based on whos turn in case of returning eated coin
    if (src === START_BLACK_END_WHITE_INDEX - 1 || src === START_WHITE_END_BLACK_INDEX + 1) {
      coinClr = this.currentTurn.whosTurn
      //check if the user realy have eaten coins
      if (this.players.find(p => p.coinColor === coinClr)?.eatenCoins.length === 0) return false;
    }
    else {
      //check if there are coins on src
      if (this.ds.board[src].length === 0) return false;
      else coinClr = this.ds.board[src][0].color
    }
    // checks: if not played with a coin of its own, if not played the right direction, 
    // if not played according to the dice results , or not according to results BUT STILL ALLOWED under very specific case of taking out coin under special case
    let isSpecialLowAllowed = this.ds.IsPossibleToTakeOutCoinByNotExactSteps(coinClr, this.currentTurn.stepsLeft);
    let arr = new Array<number>();
    let value: number = Math.abs(src-dst);
    value = value+1;
    arr.push(value);
    let isTheRightCoinToMoveBySpecialLow = this.ds.IsPossibleToTakeOutCoinByNotExactSteps(coinClr, arr);
    let isStepByDices = this.IsMoveLegalByDices(src, dst)
    if (
      this.currentTurn.whosTurn !== coinClr ||
      !this.IsRightDirectionPlayed(src, dst, coinClr) ||
      (
        !isStepByDices &&
        (
          !this.ds.IsTimeToTakeOutCoins(coinClr) ||
          (dst !== START_WHITE_END_BLACK_INDEX + 1 && dst !== START_BLACK_END_WHITE_INDEX - 1) ||
          !(isSpecialLowAllowed && isTheRightCoinToMoveBySpecialLow)
        )
      )
    ) {
      return false
    }
    // check if a moved asked clashes with "eated coins" rules
    else if (this.DoesPlayerHasEatenCoins(coinClr)) {
      // trys to play ignoring his eaten coins
      if (
        src !== START_WHITE_END_BLACK_INDEX + 1 &&
        src !== START_BLACK_END_WHITE_INDEX - 1
      )
        return false
      // trys to enter an eaten coin to the game
      else {
        resultOfMove =
          this.ds.MakeAMove(coinClr, src, dst, this.players.find((p) => p.coinColor === coinClr)?.eatenCoins.pop() as Coin)
        //tried to enter coin to non-valid position
        if (resultOfMove === false) return false
        //move worked out
        else {
          return this.UpdateLogicByMovementConclusions(resultOfMove)
        }
      }
    }
    // check if he tries to take out coins
    else if (
      dst === START_WHITE_END_BLACK_INDEX + 1 ||
      dst === START_BLACK_END_WHITE_INDEX - 1
    ) {
      // check if he is allowed to take out coins
      if (!this.ds.IsTimeToTakeOutCoins(coinClr)) {
        return false
      }
      else {
          resultOfMove = this.ds.MakeAMove(coinClr, src, dst, undefined)
          if (resultOfMove === false) return false
          else {
            return this.UpdateLogicByMovementConclusions(resultOfMove)
          }
        }
      }
    // regular movement option : into the board borders, no eaten coins return or taking out one
    else {
      resultOfMove = this.ds.MakeAMove(coinClr, src, dst, undefined)
      if (resultOfMove === false) return false
      else {
        return this.UpdateLogicByMovementConclusions(resultOfMove)
      }
    }
  }


  // updates turn, players data and winner status
  UpdateLogicByMovementConclusions(
    resultOfMove: boolean | MovementResults,
  ): MovementResults {
    resultOfMove = resultOfMove as MovementResults

    // if rival got coin eated, pushing it to its array of eaten
    if (resultOfMove.isEatenOnDst) {
      this.players.find((p) => p.coinColor === !this.currentTurn.whosTurn)?.eatenCoins.push(resultOfMove.isEatenOnDst)
    }

    // if players took a coin out, and check if he won
    if (resultOfMove.isTookOut) {
      this.players.find((p) => p.coinColor === this.currentTurn.whosTurn)?.outerCoins.push(resultOfMove.isTookOut)
      // if it was it last coin
      if (this.players.find((p) => p.coinColor === this.currentTurn.whosTurn)?.outerCoins.length === MAX_COINS_OUT) {
        resultOfMove.isWon = this.players.find((p) => p.coinColor === this.currentTurn.whosTurn) as Player
        this.winner = resultOfMove.isWon
        this.isGameOver = true
        resultOfMove.isTurnOver = true;
      }
    }

    //update turn
    let number = this.currentTurn.UpdateTurn(Math.abs(resultOfMove.dst - resultOfMove.src))
    resultOfMove.diceStepPlayed = number;
    if (this.currentTurn.movementsLeftCounter === 0) {
      this.currentTurn = new Turn(!this.currentTurn.whosTurn)
      resultOfMove.isTurnOver = true
    }
    console.log(resultOfMove);
    return resultOfMove
  }

  // check if player played in his direction of play, includes checking if src & dst not the same
  IsRightDirectionPlayed(src: number, dst: number, coinClr: boolean) {
    if (coinClr) return dst < src
    else return dst > src
  }

  // checks if specific player has eaten coins
  DoesPlayerHasEatenCoins(whosTurn: boolean) {
    return (this.players.find((p) => p.coinColor === whosTurn)?.eatenCoins.length !== 0)
  }

  // Random 2 numbers return as an array
  rollingDices(): Array<number> {
    let list: Array<number> = [
      Math.floor(Math.random() * 6 + 1),
      Math.floor(Math.random() * 6 + 1)
    ]
    return list
  }
}

export default Logic;
