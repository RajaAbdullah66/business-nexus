// routes/message-routes.js
import express from "express"
import {
  sendMessage,
  getConversation,
  getConversations,
  markMessagesAsRead,
} from "../controllers/message-controller.js"
import { protect } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Message routes
router.post("/", protect, sendMessage)
router.get("/conversations", protect, getConversations)
router.get("/conversations/:userId", protect, getConversation)
router.post("/read/:userId", protect, markMessagesAsRead)

export { router as messageRouter }