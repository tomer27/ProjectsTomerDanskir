import {combineReducers} from 'redux'
import {SocketReducer, GameReducer, BoardReducer, FriendsReducer, MessageReducer, IdReducer} from './MainReducer'

const allReducers = combineReducers({socketIO: SocketReducer,
                                     gameObject: GameReducer,
                                     gameBoard: BoardReducer,
                                     friendsList: FriendsReducer,
                                     messageList: MessageReducer,
                                     userId: IdReducer});

export default allReducers;
