const Direct = require('../models/Direct');
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();
const User = require('../models/user');
const ChatRoom = require('../models/chatRoom');
const Message = require('../models/message');

const getDirect = async (req, res) => {
    const id = req.params.id;

    try {
        const direct = await Direct.findById(id);
        if (!direct) {
            return res.status(404).json(apiCode.error('Direct not found'));
        }

        res.status(200).json(apiCode.success(direct, 'Get Direct Success'));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDirects = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if(user.directs.length === 0){
        return res.status(404).json(apiCode.error('Directs not found'));
    }else{
        const directs = await Direct.find({ _id: { $in: user.directs } });
        res.status(200).json(apiCode.success(directs, 'Get Directs Success'));
    };
  }

//info: receiverName, photoURL, lastMessage, lastMessageTime, unreadMessageCount, isOnline
const getInfoChatItem = async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);
        const directs = await Direct.find({ _id: { $in: user.directs } });
        let infoChatItems = [];
        for (let i = 0; i < directs.length; i++) {
            const direct = directs[i];
            const chatRoom = await ChatRoom.findById(direct.chatRoomId);
            const receiver = await User.findById(direct.receiverId);
            const lastMessageId = chatRoom.lastMessage? chatRoom.lastMessage : null;
            let lastMessage;
            if (!lastMessageId) {
                lastMessage = {
                    text: 'new chat',
                    createAt: 'null'
                }
            }else{
                const message = await Message.findById(lastMessageId);
                lastMessage = {
                    text: message.content === '' ? 'Đã gửi một media' : message.content,
                    time: formatTime(Date.now() - message.createAt)
                }

                function formatTime(milliseconds) {
                    const seconds = Math.floor(milliseconds / 1000);
                    if (seconds < 60) {
                        return seconds + ' seconds ago';
                    }
                    const minutes = Math.floor(seconds / 60);
                    if (minutes < 60) {
                        return minutes + ' minutes ago';
                    }
                    const hours = Math.floor(minutes / 60);
                    if (hours < 24) {
                        return hours + ' hours ago';
                    }
                    const days = Math.floor(hours / 24);
                    return days + ' days ago';
                }
            }
            // let unreadMessageCount = 0;
            // for (let j = 0; j < chatRoom.messages.length; j++) {
            //     if (!chatRoom.messages[j].isRead && chatRoom.messages[j].sender != userId) {
            //         unreadMessageCount++;
            //     }
            // }
            const infoChatItem = {
                idChatRoom: chatRoom._id,
                name: receiver.displayName,
                photoURL: receiver.photoURL,
                lastMessage: lastMessage,
                unreadMessageCount: direct.unreadMessageCount,
                isOnline: user.isOnline
            };
            infoChatItems.push(infoChatItem);
        }
        res.status(200).json(apiCode.success(infoChatItems, 'Get Info Chat Item Success'));
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    getDirect,
    getDirects,
    getInfoChatItem
}