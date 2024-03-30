const express = require("express");
const {
  registerUser,
  loginUser,
  findUser,
  getUser,
  sendOtp,
} = require("../controllers/userController");
const router = express.Router(); // Thay vì express(), chúng ta sử dụng express.Router()

router.use(express.json()); // Di chuyển middleware express.json() lên trước các route

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.get("/", getUser);
// router.post("/send-otp", sendOtp);

module.exports = router;
