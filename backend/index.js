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

// Socket
import { socketHandler } from "./socket.js";

// -------------------
// FRONTEND URL
// -------------------
const frontendURL = process.env.FRONTEND_URL || "https://8-vingo.vercel.app";

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
    origin: frontendURL,   // Allow frontend domain
    credentials: true,
    methods: ["POST", "GET"]
  }
});

app.set("io", io);

// -------------------
// MIDDLEWARES
// -------------------
app.use(cors({
  origin: frontendURL,   // Allow frontend domain
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
});
