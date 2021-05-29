import './BoardSide.css';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { AddBoardColumn } from './Actions/action';
import BoardColumns from './BoardColumns';

function BoardSide(props) {
    return (
        <div className="game-board-side">
            <div id={props.id + 'Top'} className="game-side-columns">
                <BoardColumns id={props.id + 'Top'} click={props.click}></BoardColumns>
            </div>
            <div id={props.id + 'Bottom'} className="game-side-columns">
                <BoardColumns id={props.id + 'Bottom'} click={props.click}></BoardColumns>
            </div>
        </div>
    );
}

export default BoardSide;