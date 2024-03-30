const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 30 },
    password: { type: String, required: true, minlength: 3, maxlength: 1024 },
    email: {
      type: String,
      minlength: 3,
      maxlength: 200,
      unique: true,
    },
    phoneNumber: { type: String, minlength: 10, maxlength: 15, unique: true },
    displayName: { type: String, required: true, minlength: 3, maxlength: 30 },
    gender: {
      type: String,
      enum: ["Name", "Nữ", "Khác"],
      default: "Khác",
    },
    dateOfBirth: {
      type: Date,
      min: "1900-01-01",
      max: new Date(),
    },
    photoURL: { type: String },
    thumbrailURL: { type: String },
    theme: { type: String },
    enable: { type: Boolean, default: true },
    verificationCode: { type: String },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    directs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Direct" }],
    groupDetails: [
      {
        isOnline: { type: Boolean, default: false },
        lastOnlineTime: { type: Date, default: null },
      },
    ],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
