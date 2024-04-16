const Group = require('../models/group');
const User = require('../models/user');
const GroupDetail = require('../models/groupDetail');
const ChatRoom = require('../models/chatRoom');
const ApiCode = require("../utils/apicode");
const Roles = require('../utils/rolesEnum');
const {checkPermsOfUserInGroup} = require('../utils/permission');

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


const createGroup = async (req, res) => {
  
  try {
    const ownerId = req.user.id;
    const { name, members } = req.body;
    console.log("HIHII",req.body);
    if (!name || !members || members.length < 2) {
      return res.status(400).json({ error: "Tên nhóm và ít nhất hai thành viên là bắt buộc" });
    }

    const existingGroups = await Group.find({ members: { $size: members.length } });

    const duplicateGroup = existingGroups.find(existingGroup => {
      const sortedExistingMembers = existingGroup.members.map(member => member.userId && member.userId.toString()).sort();
      const sortedNewMembers = members.map(member => member.userId && member.userId.toString()).sort();
      return JSON.stringify(sortedExistingMembers) === JSON.stringify(sortedNewMembers);
    });

    if (duplicateGroup) {
      return res.status(400).json({ error: "Nhóm đã tồn tại" });
    }

    const updatedMembers = members.map(member => ({
      _id: member._id,
      userId: member.userId,
      addByUserId: ownerId,
      roles: member.userId === ownerId ? [Roles.OWNER] : [Roles.MEMBER],
      addAt: Date.now(),
    }));

    updatedMembers.push({
      _id: ownerId,
      userId: ownerId,
      addByUserId: ownerId,
      roles: [Roles.OWNER],
      addAt: Date.now(),
    });

    const chatRoom = new ChatRoom({});
    await chatRoom.save();

    const newGroup = new Group({
      name,
      ownerId,
      members: updatedMembers,
      chatRoomId: chatRoom._id,
    });

    await newGroup.save();

    res.status(201).json({ message: "Nhóm đã được tạo thành công", group: newGroup });
  } catch (error) {
    console.error("Lỗi khi tạo nhóm:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi tạo nhóm" });
  }
};


const addMember = async (req, res) => {
    try {
        // Lấy ID của người đăng nhập từ JWT
        const ownerId = req.user.id;
        // Lấy ID của nhóm từ URL
        const groupId = req.params.groupId;

        // Lấy danh sách các thành viên mới từ body của yêu cầu
        const { newMembers } = req.body;

        // Kiểm tra tính hợp lệ của dữ liệu đầu vào
        if (!groupId || !newMembers || newMembers.length === 0) {
            return res.status(400).json({ error: 'Vui lòng cung cấp ID nhóm và ít nhất một thành viên mới' });
        }

        // Tìm nhóm dựa trên groupId
        const group = await Group.findById(groupId);
        console.log(checkPermsOfUserInGroup(ownerId, group).isOwner());
        console.log(checkPermsOfUserInGroup(ownerId, group).isAdmin());
        console.log(checkPermsOfUserInGroup(ownerId, group).canEditMember());

        // Kiểm tra tính hợp lệ của nhóm
        if (!group) {
            return res.status(404).json({ error: 'Không tìm thấy nhóm' });
        }
        // Kiểm tra quyền thêm thành viên vào nhóm
        if (checkPermsOfUserInGroup(ownerId, group).isOwner()
            || checkPermsOfUserInGroup(ownerId, group).isAdmin()) {
            return res.status(403).json({ error: 'Bạn không có quyền thêm thành viên vào nhóm này' });
        }
        // Lọc các thành viên mới để loại bỏ những thành viên đã tồn tại trong nhóm
        const filteredNewMembers = newMembers.filter(newMember => {
            return !group.members.some(existingMember => existingMember.userId.toString() === newMember.userId);
        });
        // Thêm các thành viên mới vào nhóm
        filteredNewMembers.forEach(member => {
            group.members.push({
                userId: member.userId,
                addByUserId: ownerId,
                // MẶc định ban đàu roles là member
                roles: member.roles || [Roles.MEMBER],
                addAt: Date.now()
            });
        });
        // Kiểm tra xem có thành viên nào được thêm vào không
        if (filteredNewMembers.length === 0) {
            return res.status(400).json({ error: 'Tất cả các thành viên mới đã tồn tại trong nhóm' });
        }
        // Lưu lại thông tin nhóm đã cập nhật
        // await group.save();
        // Trả về phản hồi thành công
        res.status(200).json({ success: true, message: 'Thành viên đã được thêm vào nhóm' });
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error('Lỗi khi thêm thành viên vào nhóm:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi thêm thành viên vào nhóm' });
    }
};
const deleteMember = async(req,res)=>{
    try {
        const ownerId = req.user.id;
        const groupId = req.params.groupId;
        const { members } = req.body;
        if (!groupId || !members || members.length === 0) {
            return res.status(400).json({ error: 'Vui lòng cung cấp ID nhóm và ít nhất một thành viên mới' });
        }
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ error: 'Không tìm thấy nhóm' });
        }
        if (group.ownerId.toString() !== ownerId) {
            return res.status(403).json({ error: 'Bạn không có quyền thêm thành viên vào nhóm này' });
        }
        const filteredMembers = members.filter(member => {
            return group.members.some(existingMember => existingMember.userId.toString() === member.userId);
        });
        filteredMembers.forEach(member => {
            group.members = group.members.filter(existingMember => existingMember.userId.toString() !== member.userId);
        });
        if (filteredMembers.length === 0) {
            return res.status(400).json({ error: 'Tất cả các thành viên mới đã tồn tại trong nhóm' });
        }
        await group.save();
        res.status(200).json({ success: true, message: 'Thành viên đã được xóa khỏi nhóm' });
    } catch (error) {
        console.error('Lỗi khi xóa thành viên khỏi nhóm:', error);
        res.status(500).json({ error: 'Đã xảy ra lỗi khi xóa thành viên khỏi nhóm' });
    }

}
const outGroup = async (req, res) => {
  try {
    const userId = req.user.id;
    const groupId = req.params.groupId;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Không tìm thấy nhóm" });
    }

    const memberIndex = group.members.findIndex(
      (member) => member.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return res
        .status(404)
        .json({ error: "Không tìm thấy thành viên trong nhóm" });
    }

    // Kiểm tra xem nhóm chỉ còn một thành viên hay không
    if (group.members.length === 1) {
      return res
        .status(403)
        .json({
          error:
            "Bạn không thể rời khỏi nhóm vì bạn là người dùng cuối cùng trong nhóm",
        });
    }

    group.members.splice(memberIndex, 1);
    await group.save();
    res.status(200).json({ success: true, message: "Bạn đã rời khỏi nhóm" });
  } catch (error) {
    console.error("Lỗi khi rời khỏi nhóm:", error);
    res.status(500).json({ error: "Đã xảy ra lỗi khi rời khỏi nhóm" });
  }
};

const deleteGroup = async (req, res) => {
  try {
    // Lấy ID của người đăng nhập từ JWT
    const userId = req.user.id;
    // Lấy ID của nhóm từ body của yêu cầu
    const groupId = req.body.id;
    // Tìm nhóm dựa trên ID nhóm
    const group = await Group.findById(groupId);
    // Kiểm tra xem nhóm có tồn tại không
    if (!group) {
      return res.status(404).json(apiCode.error("Nhóm không tồn tại"));
    }
    // Kiểm tra xem người dùng có quyền "owner" trong nhóm không
    const isOwner = group.members.some(
      (member) =>
        member.userId &&
        member.roles &&
        member.userId.toString() === userId &&
        member.roles.includes(Roles.OWNER)
    );
    // Nếu người dùng không phải là "owner", trả về lỗi
    if (!isOwner) {
      return res
        .status(403)
        .json(apiCode.error("Bạn không có quyền xóa nhóm này"));
    }
    // Xóa nhóm
    await Group.findByIdAndDelete(groupId);
    // Trả về phản hồi thành công
    res.status(200).json(apiCode.success(null, "Nhóm đã được xóa thành công"));
  } catch (error) {
    // Xử lý lỗi nếu có
    console.error("Lỗi khi xóa nhóm:", error);
    res.status(500).json(apiCode.error("Đã xảy ra lỗi khi xóa nhóm"));
  }
};



module.exports = {
  getGroup,
  getGroups,
  getGroupByGroupDetailId,
  getInfoGroupItem,
  getGroupIdsByUserId,
  addMember,
  createGroup,
  deleteMember,
  outGroup,
  deleteGroup,
};