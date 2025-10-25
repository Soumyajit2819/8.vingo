import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Routes
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
import aiRouter from "./routes/aiRoutes.js"; // ✅ FIXED - matches your filename

// Socket
import { socketHandler } from "./socket.js";

// -------------------
// FRONTEND URL
// -------------------
const frontendURL = process.env.FRONTEND_URL || "https://eight-vingo-2.onrender.com";

// -------------------
// EXPRESS APP
// -------------------
const app = express();
const server = http.createServer(app);

// -------------------
// SOCKET.IO SETUP
// -------------------
const io = new Server(server, {
  cors: {
    origin: frontendURL,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

app.set("io", io);

// -------------------
// MIDDLEWARES
// -------------------
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: frontendURL,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// -------------------
// ROUTES
// -------------------
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);
app.use("/api/ai", aiRouter); // ✅ AI Routes

// -------------------
// SOCKET HANDLER
// -------------------
socketHandler(io);

// -------------------
// START SERVER
// -------------------
const port = process.env.PORT || 5000;
server.listen(port, () => {
  connectDb();
  console.log(`Server started at port ${port}`);
  console.log(`Frontend allowed origin: ${frontendURL}`);
  console.log(`✅ AI Routes registered at /api/ai`);
});
