import express from "express";
import http from "http";
import { Server } from "socket.io";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import router from "./routes/router";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.URL || "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

const prisma = new PrismaClient();
const typingUsers: Record<string, string | null> = {};

app.use(cors({ origin: process.env.URL  }));
app.use(bodyParser.json());
app.use("/api", router);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("startTyping", (roomId, userId) => {
    typingUsers[roomId] = userId;
    socket.to(roomId).emit("typing", userId);
  });

  socket.on("stopTyping", (roomId) => {
    delete typingUsers[roomId];
    socket.to(roomId).emit("typing", null);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, content, roomId } = data;
    try {
      let room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room) {
        room = await prisma.room.create({
          data: {
            id: roomId,
            name: `Room_${roomId}`,
            users: { connect: [{ id: senderId }, { id: receiverId }] },
          },
        });
      }

      const newMessage = await prisma.message.create({
        data: { content, senderId, receiverId, roomId },
      });
      io.to(roomId).emit("receiveMessage", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
