import UserModel from '../DB/Schema/UserSchema';
import ChatModel from '../DB/Schema/ChatSchema';
import MessageModel from '../DB/Schema/MessageSchema';
import ErrorResult from '../Models/ErrorResult';
import Result from '../Models/Result';
import User, { CreateUserInstance } from '../Models/User';
import { CreateMessageInstance } from '../Models/Message';
import Chat, { CreateChatInstance } from '../Models/Chat';
import SocketUserMapperService from '../Services/SocketUserMapper';


const CreateUser = async(username: string, email: string , password: string) => {
    let result = ValidateUserDetailes(username, email, password);
    if(result.erros.length > 0) return result;

    result = await AreDetailesAlreadyInUse(username, email);
    if(result.erros.length > 0) return result;

    try{
        return await UserModel.create(CreateUserInstance(username, email, password));
    }catch(err) {
        console.log(err);
        result = new Result();
        result.erros.push(ErrorResult.UnknownError);
        return result;
    }
}

const ValidateUserDetailes = (username: string, email: string , password: string) => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const result = new Result();

    if(username.length <= 5) result.erros.push(ErrorResult.UsernameLength);
    if(password.length <= 6) result.erros.push(ErrorResult.PasswordLength);
    if(!emailRegex.test(String(email).toLowerCase())) result.erros.push(ErrorResult.EmailInvalid);

    return result;
}

const AreDetailesAlreadyInUse = async(username: string, email: string) => {
    const result = new Result();

    if(await UserModel.findOne({email: email}) !== null) result.erros.push(ErrorResult.EmailIsAlreadyInUse);
    if(await UserModel.findOne({username: username}) !== null) result.erros.push(ErrorResult.UsernameAlreadyInUse);

    return result;
}

const LoginValidation = async(username: string, password: string) => {
    return await UserModel.findOne({username: username, password:password});
}

const GetUserById = async(userId: string) => {
    return await UserModel.findById(userId);
}

const GetUserByName = async(username: string) => {
    return await UserModel.findOne({username: username});
}

const GetFriendsById = async(userId: string) => {
    let user = await GetUserById(userId);
    if(user != null){
        user = user as User;
        return await GetAllFriendsData(user.friends);
    } else return undefined;
}

const GetAllFriendsData = (friends: any[]) => {
    return new Promise((resolve) => {
        const friendsData: any[] = [];
        friends.forEach(async friendId => {
            const friend = await GetUserById(friendId);
            const isConnected = SocketUserMapperService.GetSocketIdByUserId(friend?.id);
            const friendData = {id: friend?.id, username: friend?.username, isConnected: isConnected ? true : false};
            friendsData.push(friendData);
            if(friendsData.length == friends.length) resolve(friendsData);
        })
    })
}

const AddMessageToChat = async(sender: string, reciever: string, content: string) => {
    let chat = await ChatModel.findOne({members: [sender, reciever]});
    if(!chat) chat = await ChatModel.findOne({members: [reciever, sender]});
    if(chat) chat = chat as Chat;
    else{
        chat = await ChatModel.create(CreateChatInstance(sender, reciever));
        let user = await GetUserById(sender) as User;
        user.chats.push(chat._id);
        user.save();
        user = await GetUserById(reciever) as User;
        user.chats.push(chat._id);
        user.save();
    }
    let message = CreateMessageInstance(sender, reciever, content);
    message = await MessageModel.create(message);
    chat.messages.push(message.id);
    await chat.save()
    return chat;
}

const GetAllUserChats = async(userId: User['_id']) => {
    const user = await GetUserById(userId);
    return await GetAllChatsData((user?.chats) as string[], user?._id);
}

const GetAllChatsData = (chatsId: any[], userId: any) => {
    return new Promise((resolve) => {
        const chatsData: any[] = [];
        let counter = 0;
        chatsId.forEach(async chatId => {
            const chat = await ChatModel.findById(chatId);
            const secondUserId = chat?.members[0].toString() == userId.toString() ? chat?.members[1] : chat?.members[0];
            const messages = await GetAllChatMessages(chat as Chat);
            chatsData.push({userId: secondUserId, messages: messages});
            counter++;
            if(counter == chatsId.length) resolve(chatsData);
        })
    })
}

const GetAllChatMessages = async(chat: Chat) => {
    return new Promise((resolve) => {
        const messages: any[] = [];
        chat.messages.forEach(async messageId => {
            const message = await MessageModel.findById(messageId);
            messages.push(message);
            if(messages.length == chat.messages.length) resolve(messages);
        })
    })
}

const SearchUserByName = (searchQuery: string) => {
    return new Promise(async(resolve) => {
        const regex = new RegExp(searchQuery, 'i')
        const users = await UserModel.find({username:{$regex: regex}});
        if(users.length == 0) resolve([]);
        let cnt = 0;
        const ret: any[] = [];
        users.forEach(user => {
            const isConnected = SocketUserMapperService.GetSocketIdByUserId(user.id) ? true : false;
            ret.push({id: user.id, username: user.username, isConnected: isConnected});
            cnt++;
            if(cnt == users.length)resolve(ret); 
        })
    })
}

const AddAsFriends = async(user1Id: string, user2Id: string) => {
    const user1 = await UserModel.findById(user1Id);
    const user2 = await UserModel.findById(user2Id);
    user1?.friends.push(user2Id);
    await user1?.save();
    user2?.friends.push(user1Id);
    await user2?.save();
    return [{id: user1?.id, username: user1?.username}, {id: user2?.id, username: user2?.username}];
}

export {CreateUser, LoginValidation, GetUserById, GetUserByName, GetFriendsById, AddMessageToChat,
     GetAllUserChats, SearchUserByName, AddAsFriends};