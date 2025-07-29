import dotenv from "dotenv";
import path from "path";
import app from "./app.js";
import db from "./config/db.js";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

dotenv.config();
const corsOptions = {
  origin: "http://localhost:5173", // Vite/React frontend
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};
app.use(cors(corsOptions));

db();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("sendMessage", ({ to, from, text }) => {
    io.to(to).emit("receiveMessage", { from, text });
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
