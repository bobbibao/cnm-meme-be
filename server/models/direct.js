const Mongoose = require('mongoose');
const { Schema, Types } = Mongoose;

const DirectSchema = new Schema({
    receiverID: {
        type: Types.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    },
    thumbnailURL: {
        type: String,
        default: ''
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    hasUnreadMessages: {
        type: Boolean,
        default: false
    },
    hasUnreadMentions: {
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
    latestMessageAt: {
        type: Date,
        default: Date.now
    },
    messages: {
        type: [Schema.Types.ObjectId],
        default: []
    }
  });

module.exports = Mongoose.model('Direct', DirectSchema, 'directs');
