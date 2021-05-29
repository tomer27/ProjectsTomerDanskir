class SocketUserMapper{
    private socketUser = new Map<string, string>();
    private userSocket = new Map<string, string>();

    Add = (userId: string, socketId: string) => {
        if(this.userSocket.get(userId) != undefined){
            this.RemoveByUserId(userId);
        }
        this.socketUser.set(socketId, userId);
        this.userSocket.set(userId, socketId);
    }

    RemoveByUserId = (userId: string) => {
        const socketId = this.userSocket.get(userId);
        if(socketId === undefined) throw new Error("socket of user " + userId + " doesn't exist");
        this.userSocket.delete(userId);
        this.socketUser.delete(socketId as string);
    }
    

    RemoveBySocketId = (socketId: string) => {
        const userId = this.socketUser.get(socketId);
        if(socketId === undefined) throw new Error("socket " + socketId + " doesn't exist");
        this.socketUser.delete(socketId);
        this.userSocket.delete(userId as string);
    }

    GetSocketIdByUserId = (userId: string) => {
        const socketId = this.userSocket.get(userId);
        return socketId;
        
    }

    GetUserIdBySocketId = (socketId: string) => {
        const userId = this.socketUser.get(socketId);
        if(socketId === undefined) throw new Error("socket " + socketId + " doesn't exist");
        else return userId as string;
    }
}

export default new SocketUserMapper();