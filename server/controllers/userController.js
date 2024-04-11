const jwt = require('jsonwebtoken');
const express = require('express');
const bodyParser = require('body-parser');
const ApiCode = require("../utils/apicode");
const User = require('../models/user');
const bcrypt = require("bcrypt");
const validator = require("validator");
const nodemailer = require("nodemailer");

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
// Hàm đăng nhập người dùng
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

// Hàm forgot password
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

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
};
