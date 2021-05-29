import Logic from "../Logic/logic";

class GameMapper<T>{
    private gameUserMapper = new Map<T, string[]>();  // index 0 = true, index 1 = false
    private userGameMapper = new Map<string, T>();

    Add = (game: T, user1Id: string, user2Id: string) => {
        if(this.userGameMapper.get(user1Id) !== undefined || this.userGameMapper.get(user2Id) !== undefined) 
            throw new Error('conflict with on of users');
        this.gameUserMapper.set(game, [user1Id, user2Id]);
        this.userGameMapper.set(user1Id, game);
        this.userGameMapper.set(user2Id,game);
        console.log('add')
        console.log(this);
    }

    Remove = (userId: string) => {
        const game = this.userGameMapper.get(userId);
        if(game === undefined) throw new Error('game is not defined');
        const gameParticipants = this.gameUserMapper.get(game as T) as string[];
        const secondUserId = gameParticipants[0] !== userId ? gameParticipants[0] : gameParticipants[1];
        this.userGameMapper.delete(userId);
        this.userGameMapper.delete(secondUserId);
        this.gameUserMapper.delete(game);
        console.log('remove')
        console.log(this);
    }

    GetGameByUser = (userId: string) => {
        console.log('get')
        console.log(this);
        const game = this.userGameMapper.get(userId);
        return game;
    }

    GetUserColor = (userId: string) => {
        console.log('get')
        console.log(this);
        const game = this.userGameMapper.get(userId) as T;
        const usersArray = this.gameUserMapper.get(game) as string[];
        if(usersArray[0] == userId) return true;
        else if(usersArray[1] == userId) return false;
        else return undefined;
    }

    GetRivalByUser = (userId: string) => {
        console.log('get')
        console.log(this);
        const game = this.userGameMapper.get(userId);
        if(game === undefined) throw new Error('game is not defined');
        const gameParticipants = this.gameUserMapper.get(game as T) as string[];
        const secondUserId = gameParticipants[0] !== userId ? gameParticipants[0] : gameParticipants[1];
        return secondUserId;
    }
}

export default new GameMapper<Logic>();

