const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
            required: true,
            index: true
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        text: {
            type: String,
            trim: true,
            maxlength: 2000,
            required: function () {
                return this.type === "TEXT";
            }
        },
        type: {
            type: String,
            enum: ["TEXT", "AUDIO", "IMAGE"],
            default: "TEXT",
            required: true
        },
        mediaUrl: {
            type: String,
            trim: true,
            required: function () {
                return this.type !== "TEXT";
            }
        }
    },
    {
        timestamps: true
    }
);

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
