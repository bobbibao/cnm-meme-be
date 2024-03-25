const Message = require("../models/message");
const ApiCode = require("../utils/apicode");
const apiCode = new ApiCode();

//get list message
const listMessage = (req, res) => {
  Message.find()
    .then((listMessage) => {
        return res.json(apiCode.success(listMessage, "List All Message Success"));
      })
      .catch((err) => {
        return res.json(apiCode.error(err, "List All Message Fail"));
      });
}

const getMessageById = (id) => {
  return Message.findById(id).exec();
}

const sendMessage = (req, res) => {
  const senderID = req.user.id;
  const content = req.body.content;
  const newMessage = new Message({ senderID, content });
  newMessage.save()
    .then((message) => {
      return res.json(apiCode.success(message, "Send Message Success"));
    })
    .catch((err) => {
      return res.json(apiCode.error(err, "Send Message Fail"));
    });
}

module.exports = {
  listMessage,
  sendMessage,
  getMessageById
}