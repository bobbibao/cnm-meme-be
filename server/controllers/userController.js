const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const ApiCode = require("../utils/apicode");
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require("bcrypt");
const validator = require("validator");
const Direct = require('../models/Direct');
const ChatRoom = require('../models/chatRoom');
const nodemailer = require("nodemailer");
const {getGroupIdsByUserId} = require('./groupController');
const Joi = require('joi');

const app = express();
app.use(bodyParser.json());

const apiCode = new ApiCode();

const multer = require('multer');
require('dotenv').config();
const AWS = require('aws-sdk');
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION
});


//user management
const createToken = (user) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ id: user.id, username: user.username }, jwtkey, { expiresIn: "3d" });
};
const registerUser = async (req, res) => {
  try {
    // Retrieve the email from session
    const { password, email, displayName, dateOfBirth } = req.body;
    // Kiểm tra xem các trường thông tin có được cung cấp không
    if (!password || !displayName || !dateOfBirth)
      return res
        .status(400)
        .json({ success: false, message: "Tất cả các trường là bắt buộc..." });
    // Kiểm tra định dạng của email
    if (!validator.isEmail(email))
      return res
        .status(400)
        .json({ success: false, message: "Email phải là email hợp lệ..." });
    // Kiểm tra mật khẩu có đủ mạnh không
    if (!validator.isStrongPassword(password))
      return res
        .status(400)
        .json({ success: false, message: "Mật khẩu phải mạnh..." });
    // Kiểm tra ngày sinh nhật có đủ 15 tuổi không
    const birthDate = new Date(dateOfBirth);
    const currentDate = new Date();
    const age = currentDate.getFullYear() - birthDate.getFullYear();
    if (
      age < 15 ||
      (age === 15 &&
        (currentDate.getMonth() < birthDate.getMonth() ||
          (currentDate.getMonth() === birthDate.getMonth() &&
            currentDate.getDate() < birthDate.getDate())))
    ) {
      return res.status(400).json({
        success: false,
        message: "Bạn phải ít nhất 15 tuổi mới được đăng ký...",
      });
    }
    // Tạo một user mới và lưu vào cơ sở dữ liệu
    user = new User({
      password,
      email,
      displayName,
      dateOfBirth,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();
    // Tạo token và gửi lại cho client
    const token = createToken(user);
    res.status(200).json({
      _id: user._id,
      password,
      email,
      displayName,
      dateOfBirth,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
};
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    // Tìm kiếm người dùng theo email
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json("Không tìm thấy người dùng");

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    console.log(password, user.password)
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log(password, user.password, isValidPassword);
    if (!isValidPassword)
      return res.status(400).json("Email hoặc mật khẩu không hợp lệ...");

    // Nếu mọi thứ hợp lệ, tạo token và gửi lại cho client
    const token = createToken(user);
    // const test = res.cookie('jwt', tokens, { httpOnly: true }); // save token in a httpOnly cookie
    // console.log(test);
    return res.status(200).json({ _id: user._id, email, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
};
const resetPassword = async (req, res) => {
  const id = req.params["id"];
  const token = req.params["token"];
  const { password } = req.body;
  const salt = await bcrypt.genSalt(10);


  jwt.verify(token, "jwt_secret_key", (err, decoded) => {
    if (err) {
      return res.json({ Status: "Error with token" });
    } else {
      bcrypt
        .hash(password, salt)
        .then((hash) => {
          User
            .findByIdAndUpdate({ _id: id }, { password: hash })
            .then((u) => res.send({ Status: "Success" }))
            .catch((err) => res.send({ Status: err }));
        })
        .catch((err) => res.send({ Status: err }));
    }
  });
};
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Kiểm tra xem email có được cung cấp không
  if (!email) {
    return res.status(400).send({ Status: "Email rỗng" });
  }

  // Kiểm tra cú pháp email
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  if (!emailRegex.test(email)) {
    return res.status(400).send({ Status: "Sai định dạng email" });
  }

  User.findOne({ email: email }).then((user) => {
    if (!user) {
      return res.send({ Status: "Người dùng không tồn tại" });
    }
    const token = jwt.sign({ id: user._id }, "jwt_secret_key", {
      expiresIn: "1d",
    });
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    console.log(process.env.URL2); 
    var mailOptions = {
      from: process.env.MAIL_USER,
      to: email,
      subject: "Reset Password Link",
      text: process.env.URL2 + `/reset-password/${user._id}/${token}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        return res.send({ Status: "Success" });
      }
    });
  });
};

const getUser = async (req, res) => {
  const id = req.params.id;
  try {
    const objectId = new mongoose.Types.ObjectId(id);
    const user = await User.findById(objectId);
    user.friends() [{},{}]
    if (!user) {
      // return res.status(404).json({ message: 'User not found' });
    }
    console.log(user);
    return res.json(user);
  } catch (err) {
    console.error(err);
    // return res.status(500).json({ message: 'Server error' });
  }
}

//Profile management
const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id); 
  const data = {
    name: user.displayName,
    email: user.email,
    gender: user.gender,
    dob: user.dateOfBirth.toISOString().split('T')[0].split('-').reverse().join('-'),
    phone: user.phoneNumber,
    avatar: user.photoURL
  };
  return res.json(apiCode.success(data, "Get Profile Success"));
};
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
const filterObj = (obj, ...allowedFields) => {
  const filtered = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = obj[key];
    }
  });
  return filtered;
};

// Define a schema for user data validation
const userSchema = Joi.object({
  displayName: Joi.string().required(),
  dateOfBirth: Joi.date().iso().required(),
  phoneNumber: Joi.string().pattern(/^(08|09|05|03|07)[0-9]{8}$/).required(), // Validate for 10-digit phone number
});

const updateUser = catchAsync(async (req, res, next) => {
  const {displayName, dateOfBirth, phoneNumber} = {displayName: req.body.name, dateOfBirth: req.body.dob.split("-").reverse().join("-"), phoneNumber: req.body.phone};
  console.log({displayName, dateOfBirth, phoneNumber});
  try {
    const { error, value } = userSchema.validate({displayName, dateOfBirth, phoneNumber});
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    // Check if the provided values differ from the old values
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (displayName == user.displayName && dateOfBirth == user.dateOfBirth.toISOString() && phoneNumber == user.phoneNumber) {
      return res.status(400).json({ message: 'No changes detected' });
    }

    // Check if the phone number and date of birth already exist in the database for other users
    const existingPhoneUser = await User.findOne({ phoneNumber });
    if (existingPhoneUser && existingPhoneUser._id.toString() !== req.user.id) {
      console.log("Phone number already exists");
      return res.status(400).json({ message: 'Phone number already exists' });
    }

    // If the phone number and date of birth are not being updated, proceed with updating the user
    const filteredBody = filterObj(value, "displayName", "dateOfBirth", "phoneNumber");

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
const storage = multer.memoryStorage({
  destination(req, file, callback) {
      callback(null, "");
  }
});
const path = require("path");
const upload = multer({
  storage,
  limits: { fileSize: 2000000 },
  fileFilter(req, file, cb) {
      checkFileType(file, cb);
  },
}).single('avatar');
function checkFileType(file, cb) {
  const fileTypes = /jpeg|jpg|png|gif/;

  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);
  if (extname && mimetype) {
      return cb(null, true);
  }
  return cb("Error: Pls upload images /jpeg|jpg|png|gif/ only!");
}
const updateAvatar = async (req, res) => {
  upload(req, res, async (err) => {
      if (err) {
          console.log('Error uploading image:', err);
          return res.status(500).json({ message: 'Failed to upload image' });
      }
      const id = req.user.id;
      const file = req.file; 
      if (!file) {
          return res.status(400).json({ message: 'No file uploaded' });
      }

      const filePath = `${Date.now().toString()}-${file.originalname}`;
      const params = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: filePath,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype
      };

      s3.upload(params, async (err, data) => {
          if (err) {
              console.log('Error uploading image:', err);
              return res.status(500).json({ message: 'Failed to upload image' });
          }
          console.log('Image uploaded successfully:', data.Location);
          const user = await User.findByIdAndUpdate(id, { photoURL: data.Location }, { new: true });
          console.log(user);
          res.status(200).json({ data: user });
      });
  });
};

//friend management
const searchUser = async (req, res) => {
  const phone = req.body.searchTerm;
  try {
    const user = await User.findOne({ phoneNumber: phone, _id: { $ne: req.user.id }});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const data = {
      _id: user._id,
      name: user.displayName,
      email: user.email,
      gender: user.gender,
      dob: user.dateOfBirth.toISOString().split('T')[0].split('-').reverse().join('-'),
      phone: user.phoneNumber,
      avatar: user.photoURL,
      isFriend: user.friends.includes(req.user.id),
      sent: user.friendsRequest.includes(req.user.id)
    }
    console.log(data);
    return res.status(200).json(apiCode.success(data, 'Search User Success'));
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
const addFriend = async (req, res) => {
  const friendId = req.body.friendId;
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: 'User is already your friend' });
    }
    if(friend.friendsRequest.includes(user._id)){
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    friend.friendsRequest.push(user._id);
    await friend.save();
    res.status(200).json(apiCode.success({}, 'Add Friend Success'));
  }catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const acceptFriend = async (req, res) => {
  const email = req.body.email;
  try {
    const user = await User.findById(req.user.id);
    const friend = await User.findOne({ email });
    const friendId = friend._id;
    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!user.friendsRequest.includes(friendId)) {
      return res.status(400).json({ message: 'No friend request found' });
    }
    user.friendsRequest = user.friendsRequest.filter((id) => id.toString() !== friendId.toString());
    user.friends.push(friendId);
    friend.friends.push(user._id);
    const chatRoom = new ChatRoom({
    });
    const direct = new Direct({
      chatRoomId: chatRoom._id,
      receiverId: friendId
    });
    const direct2 = new Direct({
      chatRoomId: chatRoom._id,
      receiverId: user._id
    });
    user.directs.push(direct);
    friend.directs.push(direct2);
    console.log(direct);
    console.log(direct2);
    await user.save();
    await friend.save();
    await chatRoom.save();
    await direct.save();
    await direct2.save();
    res.status(200).json(apiCode.success({}, 'Accept Friend Success'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllFriendRequest = async (req, res) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }
    const friendRequests = await Promise.all(user.friendsRequest.map(async (friendId) => {
      const friend = await User.findById(friendId);
      return {
        _id: friend._id,
        name: friend.displayName,
        email: friend.email,
        phone: friend.phoneNumber,
        avatar: friend.photoURL,
        gender: friend.gender
      }; 
    }));
    console.log(friendRequests);
    return res.status(200).json(apiCode.success(friendRequests, "Lấy danh sách lời mời kết bạn thành công."));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy danh sách yêu cầu kết bạn." });
  }
}
const getAllFriend = async (req, res) => {
  // Kiểm tra xem req.user tồn tại và có thuộc tính _id không
  const userId = req.user.id;
  console.log(userId);

  try {
    // Lấy thông tin người dùng từ nguồn dữ liệu
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Lấy danh sách lời mời kết bạn của người dùng
    const friends = await User.find(
      { _id: { $in: user.friends } },
      {  _id: 1, username:1, photoURL:1 }
    );

    return res.status(200).json(friends);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi lấy danh sách yêu cầu kết bạn." });
  }
};

const getUserByChatRoomId = async (req, res) => {
  const chatRoomId = req.params.chatRoomId;
  try {
    const owner = await User.findById(req.user.id);
    owner.directs.forEach(async (directId) => {
      const direct = await Direct.findById(directId);
      if (direct.chatRoomId.toString()  === chatRoomId) {
        const user = await User.findById(direct.receiverId);
        return res.json(apiCode.success(user, 'Get User Success'));
      }
    });
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsersByChatRoomId = async (chatRoomId) =>{
  try {
    const direct = await Direct.findOne({
      chatRoomId: chatRoomId
    });
    console.log(direct);
  } catch (err) {
    console.error(err);
  }
}
async function getUserProfile(req, res) {
  try {
    const username = req.params.username;
    const user = await User.findOne({ username }, 'displayName email gender photoURL thumbnailURL dateOfBirth phoneNumber groupDetails');
    // .populate('groups
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const groupIds = await getGroupIdsByUserId(user._id);
    const groupIds2 = await getGroupIdsByUserId(req.user.id);
    a = groupIds2.map((value) => {
      return value.toString();
    });
    console.log(a);
    const countCommonGroup = groupIds.filter(value => a.includes(value.toString())).length;
    const userProfile = {
      _id: user._id,
      name: user.displayName,
      email: user.email,
      gender: user.gender,
      avatar: user.photoURL,
      thumbnailURL: user.thumbnailURL,
      dob: user.dateOfBirth.toISOString().split('T')[0].split('-').reverse().join('-'),
      phone: user.phoneNumber,
      countCommonGroup: countCommonGroup // Include group IDs
    };

    res.status(200).json(apiCode.success(userProfile, 'Get User Profile Success'));
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getProfile,
  updateUser,
  updateAvatar,
  searchUser,
  addFriend,
  acceptFriend,
  getAllFriendRequest,
  getUserByChatRoomId, 
  getUserProfile,
  getUser,
  getUsersByChatRoomId,
  getAllFriend
};