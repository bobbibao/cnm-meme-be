const Direct = require('../models/Direct');
const User = require('../models/User');
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

const { getMessageById } = require('../controllers/messageController');

const listDirect = async (req, res) => {
    console.log(req.user);
    try {
        const user = await User.findById(req.user.id);
        const directs = user.directs;
        if (directs.length > 0) {
            const promises = directs.map(directId => {
                return Direct.findById(directId).exec(); // use exec() to execute the query and return a promise
            });
            const results = await Promise.all(promises); // wait for all promises to resolve
            return res.json(apiCode.success(results, "List Direct Success"));
        } else {
            return res.json(apiCode.error(null, "List Direct Fail"));
        }
    } catch (err) {
        console.error(err);
        return res.json(apiCode.error(null, "List Direct Fail"));
    }
}

const getMessages = async (req, res) => {
    try {
        const directId = req.query.directId; // how to test on postman
        const direct = await Direct.findById(directId);
        if (direct) {
            const messages = direct.messages;
            if (messages.length > 0) {
                const promises =  messages.map(messageId =>  {
                    return getMessageById(messageId);
                });
                const results = await Promise.all(promises);
                // const senderIDs = results.map(message => message.senderID);
                // const content = results.map(message => message.content);
                const messageData = results.map(message => {
                    return {
                        senderID: message.senderID,
                        content: message.content
                    }
                });
                return res.json(apiCode.success(messageData, "Get Messages Success"));
            } else {
                return res.json(apiCode.error(null, "Get Messages Fail"));
            }
        } else {
            return res.json(apiCode.error(null, "Get Messages Fail"));
        }
    } catch (err) {
        console.error(err);
        return res.json(apiCode.error(null, "Get Messages Fail"));
    }
}

module.exports = { listDirect, getMessages };
