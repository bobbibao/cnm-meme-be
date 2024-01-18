const router = require("express").Router();
const auth = require('../middleware/auth');

// Import các function đã định nghĩa trong file controllers
const {
    listOrder,
    // createUser,
} = require("../controllers/orderController");

//User
// truyền thêm tham số auth nếu api đó cần xác thực người dùng
router.get("/list-order", listOrder);
//   router.post("/create-user", auth, createUser);

module.exports = router;
