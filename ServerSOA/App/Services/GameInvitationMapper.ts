class GameInvitationMapper{
    private UserInvitationMapper = new Map<string, string>();

    Add = (inviterId: string, invitedId: string) => {
        this.UserInvitationMapper.delete(inviterId);
        this.UserInvitationMapper.set(inviterId, invitedId);
    }

    IsInvitationExist = (invitedId: string, inviterId: string) => {
        return this.UserInvitationMapper.get(inviterId) == invitedId;
    }

    IsAnyInvitationExist = (inviterId: string) => {
        return this.UserInvitationMapper.get(inviterId) != undefined; 
    }

    Remove = (inviterId: string) => {
        const invitedId = this.UserInvitationMapper.get(inviterId);
        if(this.UserInvitationMapper.delete(inviterId)) return invitedId;
        else return undefined;
    }
}

export default new GameInvitationMapper();