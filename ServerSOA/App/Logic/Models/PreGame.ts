class PreGame{
    player: boolean = false;
    cube: number = -1;
    whoStarts:number = -1;

    constructor(color: boolean, dice: number){
        this.player = color;
        this.cube = dice;
    }
}

export default PreGame;