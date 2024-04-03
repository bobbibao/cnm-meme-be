const express = require("express");
const {
  registerUser,
  loginUser,
  findUser,
  getUser,
  forgotPassword,
  resetPassword
} = require("../controllers/userController");
const router = express.Router(); // Thay vì express(), chúng ta sử dụng express.Router()
const otpController = require("../controllers/otpController");

router.use(express.json()); // Di chuyển middleware express.json() lên trước các route

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:_id", findUser);
router.get("/", getUser);
// router.post("/send-otp", sendOtp);
router.post("/send-otp", otpController.sendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:id/:token", resetPassword);

module.exports = router;
