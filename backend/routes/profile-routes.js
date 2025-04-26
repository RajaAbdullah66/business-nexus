import express from "express"
import { getUserProfile, updateUserProfile } from "../controllers/profile-controller.js"
import { protect } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Profile routes
router.get("/me", protect, getUserProfile)
router.patch("/update", protect, updateUserProfile)

export { router as profileRouter }
