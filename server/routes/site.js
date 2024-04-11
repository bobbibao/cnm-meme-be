const router = require("express").Router();
const authenticateJWT = require('../middleware/auth');

// some functions for testing, not used in the final version
const {
    listMessage,
    sendMessage,
    unsendMessage } = require("../controllers/messageController");

const {registerUser, loginUser, resetPassword, forgotPassword, updateUser, getProfile, updateAvatar,
        searchUser, addFriend, acceptFriend, getAllFriendRequest, getUserProfile, getUserByChatRoomId, getUser} 
= require('../controllers/userController');

const { getGroupDetail, getGroupDetails } = require('../controllers/groupController');
const { getDirect, getDirects, getInfoChatItem } = require('../controllers/directController');
const { getChatRoom, getChatRoomByDirectId } = require('../controllers/chatRoomController');

const otpController = require("../controllers/otpController");

const { 
    listDirect, 
    getMessages } = require("../controllers/directController");

router.get('/groupDetail/:id', authenticateJWT, getGroupDetail);
router.get('/groupDetails/', authenticateJWT, getGroupDetails);

router.get('/direct/:id', authenticateJWT, getDirect);
router.get('/directs/', authenticateJWT, getDirects);
router.get('/info-chat-item/', authenticateJWT, getInfoChatItem);

router.get('/chatRoom/:id', authenticateJWT, getChatRoom);
router.get('/chat-room/:directId', authenticateJWT, getChatRoomByDirectId);

router.get("/list-message", listMessage);
router.post("/direct/:direct/send-message", authenticateJWT, sendMessage);
router.get("/direct/:direct/get-messages", authenticateJWT, getMessages);
router.patch("/direct/:direct/unsend-message/:messageId, ", authenticateJWT, unsendMessage);
// router.get("/direct/:direct/search-messages, ", authenticateJWT, searchMessages);

router.get("/list-direct", authenticateJWT, listDirect);

//user management and authentication
router.get('/user/:id', authenticateJWT, getUser);
router.post("/users/register", registerUser);
router.post("/login", loginUser);
router.post("/users/send-otp", otpController.sendOTP);
router.post("/users/forgot-password", forgotPassword);
router.post("/users/reset-password/:id/:token", resetPassword);
router.post("/users/verify", otpController.verifyOTP);

router.get("/profile", authenticateJWT, getProfile);
router.post("/profile", authenticateJWT, updateUser);
router.get("/profile/:username", authenticateJWT, getUserProfile);
router.post("/profile/avatar", authenticateJWT, updateAvatar);
router.post('/add-friend', authenticateJWT, addFriend);
router.post('/accept-friend', authenticateJWT, acceptFriend);
router.get("/getAllFriendRequest", authenticateJWT, getAllFriendRequest);
router.post('/search-user', authenticateJWT, searchUser);



router.get('/info-user/:chatRoomId', authenticateJWT, getUserByChatRoomId);

module.exports = router;
