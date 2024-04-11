const router = require("express").Router();
const authenticateJWT = require('../middleware/auth');

// some functions for testing, not used in the final version
const {
    listMessage,
    sendMessage,
    unsendMessage } = require("../controllers/messageController");

const {registerUser, loginUser, resetPassword, forgotPassword, updateUser, getProfile, updateAvatar,
        searchUser, addFriend, acceptFriend, getAllFriendRequest} 
= require('../controllers/userController');

const otpController = require("../controllers/otpController");

const { 
    listDirect, 
    getMessages } = require("../controllers/directController");



router.get("/list-message", listMessage);
router.post("/direct/:direct/send-message", authenticateJWT, sendMessage);
router.get("/direct/:direct/get-messages", authenticateJWT, getMessages);
router.patch("/direct/:direct/unsend-message/:messageId, ", authenticateJWT, unsendMessage);
// router.get("/direct/:direct/search-messages, ", authenticateJWT, searchMessages);

router.get("/list-direct", authenticateJWT, listDirect);

//user management and authentication
router.post("/users/register", registerUser);
router.post("/login", loginUser);
router.post("/users/send-otp", otpController.sendOTP);
router.post("/users/forgot-password", forgotPassword);
router.post("/users/reset-password/:id/:token", resetPassword);
router.post("/users/verify", otpController.verifyOTP);

router.get("/profile", authenticateJWT, getProfile);
router.post("/profile", authenticateJWT, updateUser);
router.post("/profile/avatar", authenticateJWT, updateAvatar);
router.post('/add-friend', authenticateJWT, addFriend);
router.post('/accept-friend', authenticateJWT, acceptFriend);
router.get("/getAllFriendRequest", authenticateJWT, getAllFriendRequest);
router.post('/search-user', authenticateJWT, searchUser);

module.exports = router;
