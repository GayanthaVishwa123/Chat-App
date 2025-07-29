import express from "express";
import cors from "cors"; //  Import CORS
import UserRoute from "./routes/user.routes.js";
import Message from "./routes/message.routes.js";
import Author from "./routes/auth.routes.js";
import Chats from "./routes/chat.routes.js";

const app = express();

// CORS setup
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
};

app.use(cors(corsOptions)); //  Use CORS middleware
app.use(express.json()); // parse JSON requests

//  Routes
app.use("/chat-app/v1/user", UserRoute);
app.use("/chat-app/v1/message", Message);
app.use("/chat-app/v1/auth", Author);
app.use("/chat-app/v1/chats", Chats);

export default app;
