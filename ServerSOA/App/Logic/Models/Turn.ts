
class Turn {
  movementsLeftCounter!: number
  whosTurn!: boolean
  stepsLeft!: Array<number>
  constructor(player: boolean) {
    this.whosTurn = player
  }

  InitTurn(dicesRes: Array<number>) {
    this.stepsLeft = dicesRes
    if (this.IsDouble()) this.stepsLeft = dicesRes.concat(dicesRes)
    this.movementsLeftCounter = this.IsDouble() ? 4 : 2
  }

  UpdateTurn(stepPlayed: number): number {
    let diceResultPlayed: number;
    this.movementsLeftCounter--
    //if stepped by dice
    if (this.stepsLeft.includes(stepPlayed)) {
      diceResultPlayed = stepPlayed;
      console.log("played if1: " + diceResultPlayed)
      // if is not a double
      if (this.stepsLeft.some(n => n !== stepPlayed)) {
        this.stepsLeft = this.stepsLeft.filter((n) => n !== stepPlayed)
      }
      else {
        this.stepsLeft.pop();
      }
    }
    else {
      // if is not a double
      if (this.stepsLeft.some(n => n !== stepPlayed)) {
        //poping the bigger value - this is the "step" that has been made
        let biggerElement = Math.max(this.stepsLeft[0], this.stepsLeft[1]);
        diceResultPlayed = biggerElement;
        console.log("played if2: " + diceResultPlayed)
        this.stepsLeft = this.stepsLeft.filter((n) => n !== biggerElement)
      }
      else {
        diceResultPlayed = this.stepsLeft[0];
        console.log("played else: " + diceResultPlayed);
        this.stepsLeft.pop();
      }
    }
    return diceResultPlayed;
  }

  private IsDouble() {
    return this.stepsLeft[0] === this.stepsLeft[1]
  }
}

export default Turn