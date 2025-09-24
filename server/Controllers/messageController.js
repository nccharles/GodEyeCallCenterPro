const messageModel = require("../Models/messageModel");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("file");

const createMessage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(500).json({ error: "File upload failed" });

    const { chatId, senderId, text, type } = req.body;

    try {
      let mediaUrl = null;

      // If it's a media message (AUDIO/IMAGE), convert to Base64
      if (req.file) {
        mediaUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
      }

      // Create message object
      const message = new messageModel({
        chatId,
        senderId,
        text: text || null, // Allow text to be optional
        type,
        mediaUrl
      });

      // Save message
      const response = await message.save();
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });
};


const getMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await messageModel.find({ chatId });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { createMessage, getMessages };
