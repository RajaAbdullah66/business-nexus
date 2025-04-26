import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import { userRouter } from "./routes/user-routes.js"
import { authRouter } from "./routes/auth-routes.js"
import { profileRouter } from "./routes/profile-routes.js"
import { connectionRouter } from "./routes/connection-routes.js"
import { messageRouter } from "./routes/message-routes.js"

// Load environment variables
dotenv.config()

// Create Express app
const app = express()
const PORT = process.env.PORT || 5000

// Configure CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200,
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/business-nexus")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

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

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down...")
  console.log(err.name, err.message)
  process.exit(1)
})
