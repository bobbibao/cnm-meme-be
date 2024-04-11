const Group = require('../models/group');
const User = require('../models/user');
const GroupDetail = require('../models/groupDetail');
const ChatRoom = require('../models/chatRoom');
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

const getGroup = async (req, res) => {
    const id = req.params.id;

    try {
        const group = await Group.findById(id);
        if (!group) {
            return res.status(404).json(apiCode.error('Group not found'));
        }
        return res.status(200).json(apiCode.success(group, 'Get Group Success'));
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroups = async (req, res) => {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const groupDetails = await GroupDetail.find({ _id: { $in: user.groupDetails } });
    const groups = await Group.find({ _id: { $in: groupDetails.map(groupDetail => groupDetail.groupId) } });
    if(groups.length === 0){
        return res.status(404).json(apiCode.error('Groups not found'));
    }
    else{
        res.status(200).json(apiCode.success(groups, 'Get Groups Success'));
    }
};

const getGroupByGroupDetailId = async (req, res) => {
    const groupDetailId = req.params.groupDetailId;
    const group = await GroupDetail.findById(groupDetailId);
    try{
        const groups = await Group.findById(group.groupId);
        res.status(200).json(apiCode.success(groups, 'Get Group Success'));
    }
    catch (error) {
        res.status(500).json(apiCode.error('Get Group Failed'));
    }
}

const getInfoGroupItem = async (req, res) => {
    try{
        const userId = req.user.id;
        const user = await User.findById(userId);
        const groupDetails = await GroupDetail.find({ _id: { $in: user.groupDetails } });
        const groups = await Group.find({ _id: { $in: groupDetails.map(groupDetail => groupDetail.groupId) } });
        const chatRooms = await ChatRoom.find({ _id: { $in: groups.map(group => group.chatRoomId) } });
        
        const infoGroupItems = groups.map(group => {
            const chatRoom = chatRooms.find(chatRoom => chatRoom._id.equals(group.chatRoomId));
            return {
                idChatRoom: chatRoom._id,
                groupName: group.name,
                photoURL: group.photoURL,
                lastMessage: chatRoom.lastMessage,
                unreadMessageCount: group.numberOfUnreadMessage
            };
        })
        res.status(200).json(apiCode.success(infoGroupItems, 'Get Info Group Item Success'));
    }catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getGroupIdsByUserId = async (userId) => {
    const user = await User.findById(userId);
    const groupDetails = await GroupDetail.find({ _id: { $in: user.groupDetails } });
    const groups = await Group.find({ _id: { $in: groupDetails.map(groupDetail => groupDetail.groupId) } });
    return groups.map(group => group._id);
};

module.exports = {
    getGroup,
    getGroups,
    getGroupByGroupDetailId,
    getInfoGroupItem,
    getGroupIdsByUserId,
};