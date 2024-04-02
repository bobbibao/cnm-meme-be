const userModel = require("../models/userModels");
const OTP = require("../models/otpModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

// Bắt lỗi khi đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const {
      registerData,
      otp,
    } = req.body;
    const {
      username,
      password,
      email,
      phoneNumber,
      displayName,
      gender,
      dateOfBirth,
    } = registerData;

    console.log(req.body)
    // Kiểm tra xem phone number đã tồn tại chưa
    let user = await userModel.findOne({ phoneNumber });
    if (user)
      return res
        .status(400)
        .json("User with the given phone number already exists...");

    // Kiểm tra xem số điện thoại có hợp lệ không
    if (!validator.isMobilePhone(phoneNumber, "any", { strictMode: false })) {
      return res.status(400).json("Invalid phone number format...");
    }

    // Kiểm tra xem các trường thông tin có được cung cấp không
    if (
      !username ||
      !password ||
      !email ||
      !phoneNumber ||
      !displayName ||
      !gender ||
      !dateOfBirth
    )
      return res.status(400).json("All fields are required...");

    // Kiểm tra định dạng của email
    if (!validator.isEmail(email))
      return res.status(400).json("Email must be a valid email...");

    // Kiểm tra mật khẩu có đủ mạnh không
    if (!validator.isStrongPassword(password))
      return res.status(400).json("Password must be strong...");

    //Find the most recent OTP for the email
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    if (response.length === 0 || otp !== response[0].otp) {
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    // Tạo một user mới và lưu vào cơ sở dữ liệu
    user = new userModel({
      username,
      password,
      email,
      phoneNumber,
      displayName,
      gender,
      dateOfBirth,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // Tạo token và gửi lại cho client
    const token = createToken(user._id);
    res.status(200).json({
      _id: user._id,
      username,
      password,
      email,
      phoneNumber,
      displayName,
      gender,
      dateOfBirth,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Hàm đăng nhập người dùng
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log(email);
  try {
    // Tìm kiếm người dùng theo email
    let user = await userModel.findOne({ email });
    if (!user) return res.status(400).json("Invalid email or password...");

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json("Invalid email or password...");

    // Nếu mọi thứ hợp lệ, tạo token và gửi lại cho client
    const tokens = createToken(user._id);
    res.status(200).json({ _id: user._id, username: user.name, email, tokens });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// Hàm forgot password
const forgotPassword = async (req, res) => {
  
};

const findUser = async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await userModel.findById(userId);
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const getUser = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

module.exports = { registerUser, loginUser, findUser, getUser };
