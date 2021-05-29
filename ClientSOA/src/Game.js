import './Game.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BoardSide from './BoardSide';
import configurations from './configurations'
import { useHistory } from 'react-router';
import { Button } from '@material-ui/core';

const Game = (props) => {
    const history = useHistory();
    const gameData = useSelector(state => state.gameObject);
    const socket = useSelector(state => state.socketIO);
    let number = -1;
    const [isPreGame, setIsPreGame] = useState(true);
    const [isThrowDices, setIsThrowDices] = useState(false);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [rivalDice, setRivalDice] = useState();
    const [dice, setDice] = useState();
    const [dices, setDices] = useState([]);
    const [dicesToShow, setDicesToShow] = useState([]);
    const [resultAfterMoving, setResultAfterMoving] = useState(0);

    const [chosenColumnIndexSrc, setChosenColumnIndexSrc] = useState(undefined);
    const [isWinner, setIsWinner] = useState(undefined);


    const mapIndexToColumn = (index, isOut) => {
        let element;
        if (index >= 0 && index <= 5) {
            element = document.getElementById("RightBottom" + (5 - index));
        } else if (index >= 6 && index <= 11) {
            element = document.getElementById("LeftBottom" + (11 - index));
        } else if (index >= 12 && index <= 17) {
            element = document.getElementById("LeftTop" + (index - 12));
        } else if (index >= 18 && index <= 23) {
            element = document.getElementById("RightTop" + (index - 18));
        } else if (index == 24) {
            if (isOut) element = document.getElementById('outBlackCoins')
            else element = document.getElementById('whiteEatenColumn');
        } else if (index == -1) {
            if (isOut) element = document.getElementById('outWhiteCoins')
            else element = document.getElementById('blackEatenColumn');
        }
        return element;
    }


    useEffect(() => {
        InitializeSocketGameEvents();
        InitializeBoard();
    }, []);

    useEffect(() => {
        setDicesToShow(dices.map(d => {
            return { value: d, isPlayed: false };
        }))
    }, [dices])

    useEffect(() => {
        console.log("on user effect listening to dices")
        console.log(dicesToShow);
    }, [dicesToShow])

    useEffect(() => {
        let dicesToShowCopy = dicesToShow;
        const diceElement = dicesToShowCopy.find(d => d.value === resultAfterMoving.diceStepPlayed && !d.isPlayed)
        if (diceElement !== undefined) {
            diceElement.isPlayed = true;
        }
        setDicesToShow(dicesToShowCopy);
    }, [resultAfterMoving])

    const throwOneDice = () => {
        socket.emit('throwOneDice');
        setIsPreGame(false);
    }

    const throwDices = () => {
        socket.emit('throwDices');
    }

    const InitializeSocketGameEvents = () => {
        socket.on('oneDiceRivalSucceed', dice => setRivalDice(dice));
        socket.on('oneDiceSucceed', dice => setDice(dice));
        socket.on('throwOneDiceAgain', () => {
            setIsPreGame(true);
            setRivalDice(false);
            setDice(false);
        })
        socket.on('start', whoStarts => {
            setIsPreGame(false);
            setRivalDice(false);
            setDice(false);
            if (gameData.color == whoStarts) {
                setIsMyTurn(true);
                setIsThrowDices(true);
            } else {
                setIsMyTurn(false);
                setIsThrowDices(false);
            }
            setDices([]);
            setDicesToShow([]);
        });
        socket.on('throwTwoDicesSucceed', dices => {
            setDices(dices)
            setIsThrowDices(false);
        });
        socket.on('moveCoins', (result) => {
            setResultAfterMoving(result);

            const destinationElement = mapIndexToColumn(result.dst, result.isTookOut ? true : false);
            if (result.isEatenOnDst) {
                const eatenCoin = destinationElement.removeChild(destinationElement.lastChild);
                if (result.isEatenOnDst.color) document.getElementById('whiteEatenColumn').appendChild(eatenCoin);
                else document.getElementById('blackEatenColumn').appendChild(eatenCoin);
            }
            const columnElement = mapIndexToColumn(result.src);
            const removedElement = columnElement.removeChild(columnElement.lastChild);
            destinationElement.appendChild(removedElement);
        });

        socket.on('winner', (data) => {
            setIsWinner(data);
            setIsThrowDices(false);
            setIsPreGame(true);
        })
    }

    const InitializeBoard = () => {
        gameData.game.ds.board.forEach((column, index) => {
            column.forEach(coin => {
                const element = mapIndexToColumn(index);
                if (coin.color == false) element.innerHTML += `<div class="black-coin coin"></div>`;
                else element.innerHTML += `<div class="white-coin coin"></div>`;
            })
        });
    }

    const mapperColumnToIndex = (elementId) => {
        if (elementId.includes('LeftTop')) {
            number = parseInt(elementId[elementId.length - 1]) + 12;
        }
        else if (elementId.includes('LeftBottom')) {
            number = 11 - parseInt(elementId[elementId.length - 1]);
        }
        else if (elementId.includes('RightBottom')) {
            number = 5 - parseInt(elementId[elementId.length - 1]);
        }
        else if (elementId.includes('RightTop')) {
            number = parseInt(elementId[elementId.length - 1]) + 18;
        }
        else if (elementId === 'whiteEatenColumn') {
            number = 24;
        }
        else if (elementId === 'blackEatenColumn') {
            number = -1;
        }
        else if (elementId === "outBlackCoins") {
            number = 24;
        }
        else if (elementId === "outWhiteCoins") {
            number = -1;
        }
        return number;
    }

    const handleSendMovement = (elementId) => {
        for (let i = 0; i <= 23; i++) {
            let element = mapIndexToColumn(i);
            element.style.backgroundColor = "transparent";
            element.style.opacity = "1";
        }
        if (chosenColumnIndexSrc === undefined) {
            setChosenColumnIndexSrc(mapperColumnToIndex(elementId));

            let currColClicked = mapperColumnToIndex(elementId);
            let elementClicked = document.getElementById(elementId);
            if (isMyTurn) {
                if (elementClicked.childNodes.length !== 0 &&
                    (elementClicked.childNodes[0].className.includes(gameData.color ? "white" : "black"))) {
                    if (currColClicked >= 0 && currColClicked <= 23) {
                        elementClicked.style.backgroundColor = "khaki";
                        elementClicked.style.opacity = "0.5";
                    }
                    dicesToShow.forEach(d => {
                        if (!d.isPlayed) {
                            let dstCol = gameData.color ? currColClicked - d.value : currColClicked + d.value;
                            let dstElement = mapIndexToColumn(dstCol);
                            if (dstCol>=0 && dstCol<=23) {           
                                if (dstElement.childNodes.length === 0 ||
                                    (dstElement.childNodes[0].className.includes(gameData.color ? "white" : "black")) ||
                                    dstElement.childNodes.length === 1) {
                                        dstElement.style.backgroundColor = "green";
                                        dstElement.style.opacity = "0.5";
                                    }
                            }
                        }
                    })
                }

            }
        } else {
            if (chosenColumnIndexSrc != mapperColumnToIndex(elementId))
                socket.emit('move', { src: chosenColumnIndexSrc, dst: mapperColumnToIndex(elementId) });
            setChosenColumnIndexSrc(undefined);
        }
    }

    const handleTookOrEatenClick = (event) => {
        if (event.target.id == null || event.target.id == undefined || event.target.id.length == 0)
            handleSendMovement(event.target.parentElement.id);
        else
            handleSendMovement(event.target.id);
    }

    const moveCoin = (src, dst) => {
        const removeFromElement = mapIndexToColumn(src);
        const coin = removeFromElement.removeChild(removeFromElement.childNodes[removeFromElement.childNodes.length - 1]);
        const addToElement = mapIndexToColumn(dst);
        addToElement.appendChild(coin);
    }

    const backToMenu = () => {
        history.push('/menu');
    }

    const retireGame = () => {
        socket.emit('leaveGame');
        backToMenu();
    }

    return (
        <div className="game-main-grid">
            <div className={'game-board'}>
                <div className="game-board-row">
                    <div id="outWhiteCoins" className="game-out-coins" onClick={handleTookOrEatenClick}></div>
                    <div className="game-board-column">
                        <div></div>
                        <BoardSide id="Left" click={handleSendMovement}></BoardSide>
                        <div id="whiteEatenColumn" className="game-eaten-column" onClick={handleTookOrEatenClick}>
                        </div>
                        <div id="blackEatenColumn" className="game-eaten-column" onClick={handleTookOrEatenClick}></div>
                        <BoardSide id="Right" click={handleSendMovement}></BoardSide>
                    </div>
                    <div id="outBlackCoins" className="game-out-coins" onClick={handleTookOrEatenClick}></div>
                </div>
            </div>
            <div className="game-data">
                <div className="game-text">Your color: {gameData.color ? 'white' : 'black'}</div>
                {isPreGame ? <Button variant="contained" onClick={throwOneDice}>Throw one dice</Button> : null}
                {isPreGame == false && isThrowDices ? <Button variant="contained" onClick={throwDices}>Throw dices</Button> : null}
                {isPreGame == false ? (isMyTurn ? <div className="game-text">its your turn</div> : <div className="game-text">its rival's turn</div>) : null}
                {rivalDice ? <div className="game-text"> rival dice {rivalDice}</div> : null}
                {dice ? <div className="game-text">your dice: {dice}</div> : null}
                <div>
                    {dicesToShow.map(d => {
                        let imgSrc = configurations.server + "static/dice" + d.value + ".png"
                        if (d.isPlayed) return <img src={imgSrc} className="dice dice-played" id={d.value}></img>
                        else return <img src={imgSrc} className="dice" id={d.value}></img>
                    })}
                </div>
                {isWinner !== undefined ? (isWinner === gameData.color ? <div className="game-text">You are the winner!</div> : <div className="game-text">You lost!</div>) : null}
                <div>
                    <Button variant="contained" onClick={retireGame}>Back to menu</Button>
                </div>
            </div>
        </div>
    );
}

export default Game;