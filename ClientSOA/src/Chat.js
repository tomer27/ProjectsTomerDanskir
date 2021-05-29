import './Chat.css';
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { Socket } from 'socket.io-client';
import { AddMessageToState } from './Actions/action';
import Message from './Message';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';
import { Height } from '@material-ui/icons';

function Chat(props) {
    const dispatch = useDispatch();
    const socket = useSelector(state => state.socketIO);
    const messages = useSelector(state => state.messageList);
    const userId = useSelector(state => state.userId);
    const [chatMessages, setChatMessages] = useState([]);
    const [input, setInput] = useState('');
    const divRef = useRef(null);

    useEffect(() => {
        divRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [])

    useEffect(() => {
        loadMessages();
    }, [messages])

    const loadMessages = async() =>{
        const tmpMessages = [];
        messages.forEach(message => {
            if(message.sender == props.user.id || message.reciever == props.user.id) tmpMessages.push(message);
        });
        setChatMessages(tmpMessages);
        console.log(tmpMessages);
    }

    const sendMessage = () => {
        if(input != ''){
            socket.emit('messageSend', {target: props.user.id, content: input});
            dispatch(AddMessageToState({sender: userId, reciever: props.user.id, content: input, sendTime: (new Date()).toString()}));
            setInput('');
        }
    }

    const handleInputChange = (event) => {
        setInput(event.target.value);
    }

    return (
        <div className="chat-container">
            <div className="chat-main-grid">
                <div className="chat-username">{props.user.username}</div>
                <div ref={divRef} className="chat-messages-view">
                    {chatMessages.map(message => {
                        return <Message message={message}></Message> 
                    })}
                </div>
                <div className="chat-input-view">
                    <TextField style={{width: 350}} label="Type message..." variant="filled" value={input} onChange={handleInputChange}/>
                    <Button color="primary" variant="contained" onClick={sendMessage} style={{height:58, width:60}}>Send</Button>
                </div>
            </div>
        </div>
    );
}

export default Chat;