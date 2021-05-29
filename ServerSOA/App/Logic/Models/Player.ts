import Coin from './Coin'
class Player {
    coinColor!: boolean
    eatenCoins: Array<Coin> = new Array<Coin>()
    outerCoins: Array<Coin> = new Array<Coin>()
    constructor(clr: boolean) {
      this.coinColor = clr
    }
  }

  export default Player