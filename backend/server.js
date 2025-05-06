// server.js
import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import http from "http"
import { Server } from "socket.io"
import helmet from "helmet"
import morgan from "morgan"
import { connectDB } from "./config/database.js"
import { configureSocket } from "./config/socket.js"
import { userRouter } from "./routes/user-routes.js"
import { authRouter } from "./routes/auth-routes.js"
import { profileRouter } from "./routes/profile-routes.js"
import { connectionRouter } from "./routes/connection-routes.js"
import { messageRouter } from "./routes/message-routes.js"
import { errorMiddleware } from "./middlewares/error-middleware.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const server = http.createServer(app)
const PORT = process.env.PORT || 5000

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}

// Initialize Socket.io
const io = new Server(server, {
  cors: corsOptions,
  path: "/socket.io",
})

// Configure Socket.io
configureSocket(io)

// Make io accessible to routes
app.set("io", io)

// Middleware
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json())
app.use(morgan("dev"))

// Connect to MongoDB
connectDB()

// Routes
app.use("/api/auth", authRouter)
app.use("/api/users", userRouter)
app.use("/api/profile", profileRouter)
app.use("/api/connections", connectionRouter)
app.use("/api/messages", messageRouter)

// Root route
app.get("/", (req, res) => {
  res.send("Business Nexus API is running")
})

// Error handling middleware
app.use(errorMiddleware)

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...")
  console.log(err.name, err.message)
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...")
  console.log(err.name, err.message)
  process.exit(1)
})