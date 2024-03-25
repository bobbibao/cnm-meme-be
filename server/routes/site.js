const router = require("express").Router();
const authenticateJWT = require('../middleware/auth');

// some functions for testing, not used in the final version
const {
    listMessage,
    sendMessage } = require("../controllers/messageController");

const { 
    loginController, 
    getUserById } = require("../controllers/userController");

const { 
    listDirect, 
    getMessages } = require("../controllers/directController");

router.get("/list-message", listMessage);
router.post("/send-message", authenticateJWT, sendMessage);
router.post("/login", loginController);
router.get("/list-direct", authenticateJWT, listDirect);
router.get("/get-messages", authenticateJWT, getMessages);
router.get("/get-user-by-id", authenticateJWT, getUserById);

module.exports = router;
