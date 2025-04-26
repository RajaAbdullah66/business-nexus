import express from "express"
import { sendMessage, getConversation, getConversations } from "../controllers/message-controller.js"
import { protect } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Message routes
router.post("/", protect, sendMessage)
router.get("/conversations", protect, getConversations)
router.get("/conversations/:userId", protect, getConversation)

export { router as messageRouter }
