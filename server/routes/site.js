const router = require("express").Router();
const authenticateJWT = require('../middleware/auth');
const express = require('express');
const cookieParser = require('cookie-parser');
const upload = require('../middleware/upload');
const app = express();

app.use(express.json());
app.use(cookieParser());

const otpController = require("../controllers/otpController");
const { getGroupDetail, getGroupDetails } = require('../controllers/groupDetailController');
const { getDirect, getDirects, getInfoChatItem } = require('../controllers/directController');
const { getChatRoom, getChatRoomByDirectId } = require('../controllers/chatRoomController');
const { getGroup, getGroups, getGroupByGroupDetailId, getInfoGroupItem,createGroup,addMember, deleteMember, deleteGroup, getProfileGroup, outGroup } = require('../controllers/groupController');

const {registerUser, loginUser, resetPassword, forgotPassword, updateUser, getProfile, updateAvatar,
    searchUser, addFriend, acceptFriend, getAllFriendRequest, getUserProfile, getUserByChatRoomId, getUser,
getAllFriend, getUserNotInGroup, cancelFriendRequest, getAllCancelFriendRequest ,declineFriendRequest, unfriend, checkFriend}  = require('../controllers/userController');

const { getMessage, getMessages, searchMessages, unsentMessage, sendMessage, sendMedia, reactMessage,
    forwardMessage, hideMessage, deleteMessage } = require('../controllers/messageController');
const {sendResetPasswordOTP, verifyResetPasswordOTP, updatePassword} = require('../controllers/forgotPass');

router.get('/getAllFriend', authenticateJWT, getAllFriend);
router.get(
  "/getAllCancelFriendRequest",
  authenticateJWT,
  getAllCancelFriendRequest
);
router.post("/cancel-friend-request", authenticateJWT, cancelFriendRequest);
router.post("/decline-friend-request", authenticateJWT, declineFriendRequest);
router.post("/unfriend", authenticateJWT, unfriend);
router.post("check-friend", authenticateJWT, checkFriend);


//Group detail
router.get('/groupDetail/:id', authenticateJWT, getGroupDetail);
router.get('/groupDetails/', authenticateJWT, getGroupDetails);

//Group
router.get('/group/:id', authenticateJWT, getGroup);
router.get('/groups/', authenticateJWT, getGroups);
router.get('/groupByGroupDetailId/:groupDetailId', authenticateJWT, getGroupByGroupDetailId);
router.get('/info-group-items', authenticateJWT, getInfoGroupItem);
router.post('/groups/:chatRoomId/delete-member', authenticateJWT, deleteMember);
router.post("/groups/:chatRoomId/outGroup", authenticateJWT, outGroup);

router.post("/creategroup", authenticateJWT,upload.single('photo'), createGroup);
// router.post("/groups/:groupId/addMember", authenticateJWT, addMember);
router.post("/groups/:chatRoomId/add-member", authenticateJWT, addMember);
router.post("/delete-group", authenticateJWT, deleteGroup);
router.get("/profile-group/:groupId", authenticateJWT, getProfileGroup);
//Direct
router.get('/direct/:id', authenticateJWT, getDirect);
router.get('/directs/', authenticateJWT, getDirects);
router.get('/info-chat-item/', authenticateJWT, getInfoChatItem);

//Chat room
router.get('/chatRoom/:id', authenticateJWT, getChatRoom);
router.get('/chat-room/:directId', authenticateJWT, getChatRoomByDirectId);

//user management and authentication
router.get('/user/:id', authenticateJWT, getUser);
router.post("/users/register", registerUser);
router.post("/login", loginUser);
router.post("/users/send-otp", otpController.sendOTP);
router.post("/users/forgot-password", forgotPassword);
router.post("/users/reset-password/:id/:token", resetPassword);
router.post("/users/verify", otpController.verifyOTP);
router.post("/users/update-password", updatePassword);
router.post("/users/send-reset-passwordOTP", sendResetPasswordOTP);
router.post("/users/verify-reset-passwordOTP", verifyResetPasswordOTP);

// profile management
router.get("/profile", authenticateJWT, getProfile);
router.post("/profile", authenticateJWT, updateUser);
router.get("/profile/:id", authenticateJWT, getUserProfile);
router.post("/profile/avatar", authenticateJWT, updateAvatar);
router.post('/add-friend', authenticateJWT, addFriend);
router.post('/accept-friend', authenticateJWT, acceptFriend);
router.get("/getAllFriendRequest", authenticateJWT, getAllFriendRequest);
router.post('/search-user', authenticateJWT, searchUser);
router.get('/info-user/:chatRoomId', authenticateJWT, getUserByChatRoomId);
router.get('/info-add-member/:groupId', authenticateJWT, getUserNotInGroup);
//Message
router.get('/message/:id', authenticateJWT, getMessage);
router.post('/messages/:chatRoomId', authenticateJWT, sendMessage);
router.get('/messages/:chatRoomId', authenticateJWT, getMessages);
router.get('/messages/:chatRoomId/search', searchMessages);
router.post('/send-message/', authenticateJWT, sendMessage);
router.post('/send-media/', authenticateJWT, upload.array('media'), sendMedia);
router.patch('/unsent-message/:id', authenticateJWT, unsentMessage);
router.patch('/hide-message/:id', authenticateJWT, hideMessage);
router.patch('/react-message/:id', authenticateJWT, reactMessage);
router.patch('/forward-message/:id', authenticateJWT, forwardMessage);
router.delete('/message/:id', authenticateJWT, deleteMessage);


module.exports = router;
