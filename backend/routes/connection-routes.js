import express from "express"
import {
  sendConnectionRequest,
  getConnectionRequests,
  updateConnectionStatus,
} from "../controllers/connection-controller.js"
import { protect } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Connection routes
router.post("/", protect, sendConnectionRequest)
router.get("/", protect, getConnectionRequests)
router.patch("/:connectionId", protect, updateConnectionStatus)

export { router as connectionRouter }
