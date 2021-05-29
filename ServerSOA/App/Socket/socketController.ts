import io from './webSocket';
import { AddMessageToChat, GetUserById } from '../Repositories/UserRepository';
import SocketUserMapperService from '../Services/SocketUserMapper';
import GameMapperService from '../Services/GameMapper';
import GameInvitationMapper from '../Services/GameInvitationMapper';
import Logic from '../Logic/logic';
import MovementResults from '../Logic/Models/MovementResults';
import Player from '../Logic/Models/Player';
let RandomGameQueue: undefined | any;

const OnSocketConnection = (socket: any) => {
    AddToSocketMapper(socket);
    InformFriendsOnConnection(socket);
    GameInviteListener(socket);
    AcceptGameInvitationListener(socket);
    ThrowOneDice(socket);
    RequestRandomGame(socket);
    ThrowDices(socket);
    Move(socket);
    OnMessageSend(socket);
    OnInvokeLeaveGame(socket);
}

const RequestRandomGame = (socket: any) => {
    socket.on('requestRandomGame', () => {
        GameInvitationMapper.Remove(socket.request.user._id);
        if(RandomGameQueue === undefined){
            RandomGameQueue = socket.request.user._id;
            socket.emit('waitInQueue', true);
        } else if(RandomGameQueue != socket.request.user._id){
            const userInQueue = RandomGameQueue;
            GameMapperService.Add(new Logic(), socket.request.user._id, userInQueue);
            socket.emit('joinGame', {color: true, game: GameMapperService.GetGameByUser(userInQueue)}); 
            GetSocketById(SocketUserMapperService.GetSocketIdByUserId(userInQueue) as string)
                .emit('joinGame', {color: false, game: GameMapperService.GetGameByUser(userInQueue)}); 
            console.log('starting game');
            RandomGameQueue = undefined;
        }
        console.log(RandomGameQueue);
    })
}

// informs all of user's friends (if connected) that the has connected
const InformFriendsOnConnection = async(socket: any) => {
    const user = await GetUserById(socket.request.user._id);
    if(user === null) throw new Error("user doesn't exist");
    user.friends.forEach(friendId => {
        const socketId = SocketUserMapperService.GetSocketIdByUserId(friendId);
        if(socketId !== undefined){
            GetSocketById(socketId).emit('friendConnected', user._id);
        }
    });
}

// adds the user to socket mapper
const AddToSocketMapper = (socket: any) => {
    SocketUserMapperService.Add(socket.request.user._id, socket.id);
}

// recieves invitation from one user (sender) and sends it to the second user
// also sends to the sender a result which says if the invitation is valid (second user is exist and connected)
const GameInviteListener = (socket: any) => {
    socket.on('invite', async(id: string) => {
        if(!await CheckIfUserExistAndConnected(id)) socket.emit('invitationResult', false);
        else{
            if(RandomGameQueue == socket.request.user._id) RandomGameQueue = undefined;
            const previousInvitedUser = GameInvitationMapper.Remove(socket.request.user._id);
            if(previousInvitedUser != undefined) GetSocketById(SocketUserMapperService.GetSocketIdByUserId(id) as string).emit('invitationCancelled', socket.request.user._id);
            GameInvitationMapper.Add(socket.request.user._id, id);
            socket.emit('invitationResult', true);
            GetSocketById(SocketUserMapperService.GetSocketIdByUserId(id) as string)
                .emit('invited', socket.request.user._id);
        }
        console.log(GameInvitationMapper);
    });
}

// recieves an invitation accept (validate in the function) and then sends to both users order to go to game with game data
const AcceptGameInvitationListener = (socket: any) => {
    socket.on('acceptInvitation', async(id: string) => {
        if(!await CheckIfUserExistAndConnected(id)) socket.emit('invitationResult', false);
        else{
            console.log(GameInvitationMapper);
            if(GameInvitationMapper.IsInvitationExist(socket.request.user._id, id)){
                GameInvitationMapper.Remove(socket.request.user._id);
                GameMapperService.Add(new Logic(), socket.request.user._id, id);
                socket.emit('joinGame', {color:  true, game: GameMapperService.GetGameByUser(id)}); 
                GetSocketById(SocketUserMapperService.GetSocketIdByUserId(id) as string)
                    .emit('joinGame', {color: false, game: GameMapperService.GetGameByUser(id)}); 
            } else socket.emit('joinGame', false);
        }
    });
}

const ThrowOneDice = (socket: any) => {
    socket.on('throwOneDice', () => {
        const game = GameMapperService.GetGameByUser(socket.request.user._id);
        if(game){
            const userColor = GameMapperService.GetUserColor(socket.request.user._id) as boolean;
            const diceResult = game.HandleThrowOneDice(userColor);
            socket.emit('oneDiceSucceed', diceResult);
            const secondUserId = GameMapperService.GetRivalByUser(socket.request.user._id);
            const socketId = SocketUserMapperService.GetSocketIdByUserId(secondUserId) as string;
            const rivalSocket = GetSocketById(socketId)
            rivalSocket.emit('oneDiceRivalSucceed', diceResult);
            console.log(userColor);
            setTimeout(() => {
                if(game.preGame?.whoStarts == 0){
                    socket.emit('throwOneDiceAgain');
                    rivalSocket.emit('throwOneDiceAgain');
                    game.ReinitializePreGame();
                } else if(game.preGame?.whoStarts == 1){
                    socket.emit('start', true);
                    rivalSocket.emit('start', true);
                    console.log('true starts')

                } else if(game.preGame?.whoStarts == 2){
                    socket.emit('start', false);
                    rivalSocket.emit('start', false);
                    console.log('false starts')

                }
            }, 1500); 
        }
    })
}

const ThrowDices = (socket: any) => {
    socket.on('throwDices', () => {
        const game = GameMapperService.GetGameByUser(socket.request.user._id);
        if(game){
            const userColor = GameMapperService.GetUserColor(socket.request.user._id) as boolean;
            if(game.currentTurn.whosTurn == userColor){
                const dices = game.HandleThrowTwoDices();
                const rivalId = GameMapperService.GetRivalByUser(socket.request.user._id);
                const rivalSocketId = SocketUserMapperService.GetSocketIdByUserId(rivalId) as string;
                socket.emit('throwTwoDicesSucceed', dices);
                const rivalSocket = GetSocketById(rivalSocketId);
                rivalSocket.emit('throwTwoDicesSucceed', dices);
                setTimeout(() => {
                    if(!game.HandleCheckAbilityToPlayByDices()) {
                        socket.emit('start', game.currentTurn.whosTurn);
                        rivalSocket.emit('start', game.currentTurn.whosTurn);
                    }
                }, 500)
            }
        }
    })
}

const Move = (socket: any) => {
    socket.on('move', (movement: any) => {
        const game = GameMapperService.GetGameByUser(socket.request.user._id);
        if(game){
            const userColor = GameMapperService.GetUserColor(socket.request.user._id) as boolean;
            if(game.currentTurn.whosTurn == userColor){
                let result = game.HandleMove(movement.src, movement.dst);
                if(result){
                    result = result as MovementResults;
                    const rivalId = GameMapperService.GetRivalByUser(socket.request.user._id);
                    const rivalSocketId = SocketUserMapperService.GetSocketIdByUserId(rivalId) as string;
                    socket.emit('moveCoins', result);
                    const rivalSocket = GetSocketById(rivalSocketId);
                    rivalSocket.emit('moveCoins', result);
                    
                    if(result.isWon){
                        socket.emit('winner', (result.isWon as Player).coinColor);
                        rivalSocket.emit('winner', (result.isWon as Player).coinColor);
                    }
                    if(result.isTurnOver || !game.HandleCheckAbilityToPlayByDices()) {
                        socket.emit('start', game.currentTurn.whosTurn);
                        rivalSocket.emit('start', game.currentTurn.whosTurn);
                    }
                }
            }
        }
    })
}

const OnMessageSend = (socket: any) => {
    socket.on('messageSend', async(message: any) => {
        if(await GetUserById(message.target)) {
            await AddMessageToChat(socket.request.user._id, message.target, message.content);
            const recieverSocketId = SocketUserMapperService.GetSocketIdByUserId(message.target);
            console.log(SocketUserMapperService);
            if(recieverSocketId){
                GetSocketById(recieverSocketId).emit("messageRecieved", {sender: socket.request.user._id, reciever: message.target, content: message.content, sendTime: new Date()});
            }
        }
    })
}


// checks if user is exist and connected
const CheckIfUserExistAndConnected = async(id: any) => {
    if(await GetUserById(id) == null || SocketUserMapperService.GetSocketIdByUserId(id) == undefined) return false;
    else return true;
}

const GetSocketById = (socketId: string) => {
    return io.of('/').sockets.get(socketId);
}
const OnInvokeLeaveGame = (socket: any) => {
    socket.on('leaveGame', () => {
        LeaveGame(socket);
    });
}

const LeaveGame = (socket: any) => {
    const game = GameMapperService.GetGameByUser(socket.request.user._id);
    if(game){
        const rivalId = GameMapperService.GetRivalByUser(socket.request.user._id);
        const rivalSocketId = SocketUserMapperService.GetSocketIdByUserId(rivalId);
        if(rivalSocketId)
            GetSocketById(rivalSocketId).emit('winner', GameMapperService.GetUserColor(rivalId));

        GameMapperService.Remove(rivalId);
    }
}

module.exports = () => {
    io.on('connection', (socket: any) => {
        OnSocketConnection(socket);
        socket.on('disconnect', (reason: any) => {
            console.log('user disconnected');
            OnSocketDisconnect(socket);
        });
    });
}

const OnSocketDisconnect = (socket: any) => {
    LeaveGame(socket);
    CleanFromGameInvitationMapper(socket);
    CleanFromUserSocketMapper(socket);
    InformFriendsOnDisconnection(socket);
}

const InformFriendsOnDisconnection = async(socket: any) => {
    const user = await GetUserById(socket.request.user._id);
    if(user === null) throw new Error("user doesn't exist");
    user.friends.forEach(friendId => {
        const socketId = SocketUserMapperService.GetSocketIdByUserId(friendId);
        if(socketId !== undefined){
            GetSocketById(socketId).emit('friendDisconnected', user._id);
        }
    });
}

const CleanFromUserSocketMapper = (socket: any) => {
    SocketUserMapperService.RemoveBySocketId(socket.id);
}

const CleanFromGameInvitationMapper = (socket: any) => {
    if(GameInvitationMapper.IsAnyInvitationExist(socket.request.user._id)){
        const invitedId = GameInvitationMapper.Remove(socket.request.user._id) as string;
        if(CheckIfUserExistAndConnected(invitedId)){
            const invitedSocketId = SocketUserMapperService.GetSocketIdByUserId(invitedId) as string;
            const invitedSocket = GetSocketById(invitedSocketId);
            invitedSocket.emit('InvitationCancelled', socket.request.user._id);
        }
    }
}