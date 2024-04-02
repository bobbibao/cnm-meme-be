const Mongoose = require('mongoose');
const { Schema, Types } = Mongoose;

//direct.js: _id, chatRoomId, receiverId, isOnline, lastActiveTime, isArchived, isDeleted, isMuted, isPinned, hasUnreadMessage, numberOfUnreadMessage

const DirectSchema = new Schema({
    chatRoomId: {
        type: Types.ObjectId,
        ref: 'ChatRoom'
    },
    receiverId: {
        type: Types.ObjectId,
        ref: 'User'
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isMuted: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    unreadMessageCount: {
        type: Number,
        default: 0
    }
  });

module.exports = Mongoose.model('Direct', DirectSchema, 'directs');
