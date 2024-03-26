const userModel = require("../models/userModels");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  const jwtkey = process.env.JWT_SECRET_KEY;
  return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

// Bắt lỗi khi đăng ký người dùng
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      displayName,
      gender,
      dateOfBirth,
    } = req.body;

    // Kiểm tra xem email đã tồn tại chưa
    let user = await userModel.findOne({ email });
    if (user)
      return res
        .status(400)
        .json("User with the given email already exists...");

    // Kiểm tra xem các trường thông tin có được cung cấp không
    if (!username || !email || !password || !displayName || !gender || !dateOfBirth)
      return res.status(400).json("All fields are required...");

    // Kiểm tra định dạng của email
    if (!validator.isEmail(email))
      return res.status(400).json("Email must be a valid email...");

    // Kiểm tra mật khẩu có đủ mạnh không
    if (!validator.isStrongPassword(password))
      return res.status(400).json("Password must be strong...");

    // Tạo một user mới và lưu vào cơ sở dữ liệu
    user = new userModel({
      username,
      email,
      password,
      displayName,
      gender,
      dateOfBirth
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // Tạo token và gửi lại cho client
    const token = createToken(user._id);
    res
      .status(200)
      .json({
        _id: user._id,
        username,
        email,
        password,
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
  try {
    // Tìm kiếm người dùng theo email
    let user = await userModel.findOne({ email });
    if (!user) return res.status(400).json("Invalid email or password...");

    // So sánh mật khẩu đã hash với mật khẩu nhập vào
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).json("Invalid email or password...");

    // Nếu mọi thứ hợp lệ, tạo token và gửi lại cho client
    const token = createToken(user._id);
    res.status(200).json({ _id: user._id, username: user.name, email, token });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
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
