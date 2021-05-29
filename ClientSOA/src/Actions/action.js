export const CreateSocket = (socket) => ({
	type: "create_socket",
	payload: {
        socket: socket
    }
})

export const RemoveSocket = () => ({
	type: "remove_socket"
})

export const CreateGame = (game) => ({
	type: "create_game",
	payload: {
        game: game
    }
})

export const RemoveGame = () => ({
	type: "remove_game"
});

export const AddBoardColumn = (column) => ({
	type: "add_board_column",
	payload: {
		column: column
	}
});

export const AddFriendToList = (friend) => ({
	type: "add_friend_to_list",
	payload: {
		friend: friend
	}
});

export const AddMessageToState = (message) => ({
	type: "add_message_to_chat",
	payload: {
		message: message
	}
})

export const SaveUserId = (userId) => ({
	type: "save_user_id",
	payload: {
		userId: userId
	}
})

export const ChangeIsConnected = (userId, isConnected) => ({
	type: "change_is_connected",
	payload: {
		userId: userId,
		isConnected: isConnected
	}
})