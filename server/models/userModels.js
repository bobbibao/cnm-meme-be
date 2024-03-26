//userName

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, minlength: 3, maxlength: 30 },
    email: {
      type: String,
      require: true,
      minlength: 3,
      maxlength: 200,
      unique: true,
    },
    password: { type: String, required: true, minlength: 3, maxlength: 1024 },
    displayName: { type: String, required: true, minlenght: 3, maxlength: 30 },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: "OTHER",
    },
    dateOfBirth: {
      type: Date,
      min: "1900-01-01", // Giới hạn ngày sinh tối thiểu
      max: new Date(), // Giới hạn ngày sinh tối đa là ngày hiện tại
    },
    imageLink: { type: String }, // Ví dụ về một URL ảnh của người dùng
    roles: {
      type: [String],
      enum: ["User", "Admin"],
      default: "User",
    }, // Ví dụ về một mảng các vai trò của người dùng
    enable: { type: Boolean, default: true }, // Ví dụ về trạng thái kích hoạt của tài khoản
    verificationCode: { type: String }, // Ví dụ về mã xác minh email hoặc số điện thoại
    onlineStatus: { type: Boolean, default: false }, // Ví dụ về trạng thái trực tuyến của người dùng
    lastOnline: { type: Date }, // Ví dụ về thời gian người dùng cuối cùng trực tuyến
    createdAt: { type: Date, default: Date.now }, // Ví dụ về thời gian tạo tài khoản
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
