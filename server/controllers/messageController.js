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

// const getMessageById = (id) => {
//   return Message.findById(id).exec();
// }

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

const unsendMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (!req.user.id.equals(message.sender)) {
      return res.status(403).json({ error: 'You can only unsend your own messages' });
    }

    message.content = null;
    await message.save();

    res.json({ message: 'Message has been unsent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};


module.exports = {
  listMessage,
  sendMessage,
  unsendMessage
}