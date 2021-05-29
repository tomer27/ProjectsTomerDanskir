import './Message.css';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { SendSharp } from '@material-ui/icons';

function Message(props) {
    const friendList = useSelector(state => state.friendsList);
    const userId = useSelector(state => state.userId);
    const [sender, setSender] = useState();

    useEffect(() => {
        if(props.message.sender == userId) setSender('you');
        else{
            friendList.forEach(friend => {
                if(props.message.sender == friend.id) setSender(friend.username);
            });
        }
    }, [])

    return (
        <div className={sender == 'you' ? 'message-sender' : 'message-reciever'}>
            <div className="message-container">
                {props.message.content}
            </div> 
        </div>
    );
}

export default Message;