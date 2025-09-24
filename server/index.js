const cors = require("cors");
const mongoose = require("mongoose");
const express = require("express");
const server = require("socket.io");

const chatRoute = require("./Routes/chatRoute");
const messageRoute = require("./Routes/messageRoute");
const userRoute = require("./Routes/userRoute");

require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRoute);
app.use("/api/chats", chatRoute);
app.use("/api/messages", messageRoute);

app.get("/", (req, res) => {
    res.send("Welcome to our chat API...");
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

const uri = process.env.ATLAS_URI;
const port = process.env.PORT || 5000;

const expressServer = app.listen(port, () => {
    console.log(`Server running on port: ${port}...`);
});

// MongoDB Connection
mongoose
    .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connection established..."))
    .catch((error) => console.error("MongoDB connection failed:", error.message));

const io = new server.Server(expressServer, {
    cors: {
        origin: process.env.CLIENT_URL,
    },
});

let onlineUsers = [];

io.on("connection", (socket) => {
    try {
        // Add user
        socket.on("addNewUser", (userId) => {
            try {
                if (!onlineUsers.some((user) => user?.userId === userId)) {
                    onlineUsers.push({
                        userId,
                        socketId: socket.id,
                    });
                }
                io.emit("getUsers", onlineUsers);
            } catch (error) {
                console.error("Error in addNewUser:", error);
            }
        });

        // Handle text message
        socket.on("sendMessage", (message) => {
            try {
                const user = onlineUsers.find((user) => user?.userId === message.recipientId);
                if (user) {
                    io.to(user?.socketId).emit("getMessage", message);
                    io.to(user?.socketId).emit("getNotification", {
                        senderId: message.senderId,
                        isRead: false,
                        date: new Date(),
                    });
                }
            } catch (error) {
                console.error("Error in sendMessage:", error);
            }
        });

        // Handle user disconnect
        socket.on("disconnect", () => {
            try {
                onlineUsers = onlineUsers.filter((user) => user?.socketId !== socket.id);
                io.emit("getUsers", onlineUsers);
            } catch (error) {
                console.error("Error in disconnect:", error);
            }
        });
    } catch (error) {
        console.error("Error in socket connection:", error);
    }
});
