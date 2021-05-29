import Coin from './Coin'
import Player from './Player'

class MovementResults {
  src: number = 0
  dst: number = 0
  diceStepPlayed: number=0
  isWon: boolean | Player = false
  isEatenOnDst: undefined | Coin // if the movement caused an eating, undefined for prefference use by developers
  isTookOut: undefined | Coin // if movement caused taking out a coin, undefined for prefferenced use by developers
  isTurnOver: boolean = false // after the move

  constructor(
    from: number,
    to: number,
    isEat: undefined | Coin,
    isOut: undefined | Coin,
  ) {
    this.src = from
    this.dst = to
    this.isEatenOnDst = isEat
    this.isTookOut = isOut
  }
}

export default MovementResults