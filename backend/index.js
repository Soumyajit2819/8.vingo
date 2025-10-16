import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import itemRouter from "./routes/item.routes.js";
import shopRouter from "./routes/shop.routes.js";
import orderRouter from "./routes/order.routes.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

// --- START: DEPLOYMENT CHANGE ---
// We will get the frontend URL from an environment variable.
// This makes your code flexible for both local development and production.
const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
// --- END: DEPLOYMENT CHANGE ---

const app = express( );
const server = http.createServer(app );

const io = new Server(server, {
   cors: {
    // --- START: DEPLOYMENT CHANGE ---
    origin: frontendURL, // Use the variable here
    // --- END: DEPLOYMENT CHANGE ---
    credentials: true,
    methods: ['POST', 'GET']
   }
});

app.set("io", io);

const port = process.env.PORT || 5000;

// --- START: DEPLOYMENT CHANGE ---
app.use(cors({
    origin: frontendURL, // And use the variable here
    credentials: true
}));
// --- END: DEPLOYMENT CHANGE ---

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

socketHandler(io);

server.listen(port, () => {
    connectDb();
    console.log(`server started at ${port}`);
});
