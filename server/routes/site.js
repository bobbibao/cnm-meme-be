const router = require("express").Router();
const authenticateJWT = require('../middleware/auth');

// some functions for testing, not used in the final version
const {
    listMessage,
    sendMessage,
    unsendMessage } = require("../controllers/messageController");

const { 
    loginController, 
    getUserById,
    updateUser,
    getProfile } = require("../controllers/userController");

const { 
    listDirect, 
    getMessages } = require("../controllers/directController");


router.get("/list-message", listMessage);
router.post("/direct/:direct/send-message", authenticateJWT, sendMessage);
router.get("/direct/:direct/get-messages", authenticateJWT, getMessages);
router.patch("/direct/:direct/unsend-message/:messageId, ", authenticateJWT, unsendMessage);
// router.get("/direct/:direct/search-messages, ", authenticateJWT, searchMessages);

router.post("/login", loginController);
router.get("/list-direct", authenticateJWT, listDirect);
router.get("/get-user-by-id", authenticateJWT, getUserById);
router.get("/profile", authenticateJWT, getProfile);
router.patch("/profile", authenticateJWT, updateUser);

module.exports = router;
