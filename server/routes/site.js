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
const { getGroup, getGroups, getGroupByGroupDetailId, getInfoGroupItem,createGroup,addMember, deleteMember, outGroup, deleteGroup } = require('../controllers/groupController');

const {registerUser, loginUser, resetPassword, forgotPassword, updateUser, getProfile, updateAvatar,
    searchUser, addFriend, acceptFriend, getAllFriendRequest, getUserProfile, getUserByChatRoomId, getUser}  = require('../controllers/userController');

const { getMessage, getMessages, searchMessages, unsentMessage, sendMessage, sendMedia, reactMessage,
    forwardMessage, hideMessage, deleteMessage } = require('../controllers/messageController');

//Group detail
router.get('/groupDetail/:id', authenticateJWT, getGroupDetail);
router.get('/groupDetails/', authenticateJWT, getGroupDetails);

//Group
router.get('/group/:id', authenticateJWT, getGroup);
router.get('/groups/', authenticateJWT, getGroups);
router.get('/groupByGroupDetailId/:groupDetailId', authenticateJWT, getGroupByGroupDetailId);
router.get('/info-group-items', authenticateJWT, getInfoGroupItem);
router.delete('/groups/:groupId/deleteMember', authenticateJWT, deleteMember);
router.post('/groups/:groupId/outGroup', authenticateJWT, outGroup);

router.post("/creategroup", authenticateJWT, createGroup);
router.post("/groups/:groupId/addMember", authenticateJWT, addMember);
router.post("/delete-group", authenticateJWT, deleteGroup);

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

// profile management
router.get("/profile", authenticateJWT, getProfile);
router.post("/profile", authenticateJWT, updateUser);
router.get("/profile/:username", authenticateJWT, getUserProfile);
router.post("/profile/avatar", authenticateJWT, updateAvatar);
router.post('/add-friend', authenticateJWT, addFriend);
router.post('/accept-friend', authenticateJWT, acceptFriend);
router.get("/getAllFriendRequest", authenticateJWT, getAllFriendRequest);
router.post('/search-user', authenticateJWT, searchUser);
router.get('/info-user/:chatRoomId', authenticateJWT, getUserByChatRoomId);

//Message
router.get('/message/:id', authenticateJWT, getMessage);
router.post('/messages/:chatRoomId', authenticateJWT, sendMessage);
router.get('/messages/:chatRoomId', authenticateJWT, getMessages);
router.post('/search-messages', authenticateJWT, searchMessages);
router.post('/send-message/', authenticateJWT, sendMessage);
router.post('/send-media/', authenticateJWT, upload.array('media'), sendMedia);
router.patch('/unsent-message/:id', authenticateJWT, unsentMessage);
router.patch('/hide-message/:id', authenticateJWT, hideMessage);
router.patch('/react-message/:id', authenticateJWT, reactMessage);
router.patch('/forward-message/:id', authenticateJWT, forwardMessage);
router.delete('/message/:id', authenticateJWT, deleteMessage);


module.exports = router;
