const Mongoose = require('mongoose');
const { Schema, Types } = Mongoose;

const GroupSchema = new Schema({
  name: {
    type: String,
    default: 'New Group'
  },
  type: {
    type: String,
    default: 'group'
  },
  ownerID: {
    type: Types.ObjectId,
    default: ''
  },
  photoURL: {
    type: String,
    default: ''
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
  createAt: {
    type: Date,
    default: Date.now
  },
  updateAt: {
    type: Date,
    default: Date.now
  },
  latestMessageAt: {
    type: Date,
    default: Date.now
  },
  members:[Schema.Types.ObjectId],
  messages: {
    type: [Schema.Types.ObjectId],
    default: []
  }
});

module.exports = Mongoose.model('Group', GroupSchema, 'groups');
