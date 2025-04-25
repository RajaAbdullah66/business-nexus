import express from "express"
import { register, login, getCurrentUser } from "../controllers/auth-controller.js"
import { protect } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Auth routes
router.post("/register", register)
router.post("/login", login)
router.get("/me", protect, getCurrentUser)

export { router as authRouter }
