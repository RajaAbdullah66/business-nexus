import express from "express"
import { protect, restrictTo } from "../middlewares/auth-middleware.js"

const router = express.Router()

// Get all entrepreneurs (for investors)
router.get("/entrepreneurs", protect, restrictTo("investor"), (req, res) => {
  // This will be implemented in Week 2
  res.status(200).json({
    status: "success",
    message: "This endpoint will return all entrepreneurs",
  })
})

// Get all investors (for entrepreneurs)
router.get("/investors", protect, restrictTo("entrepreneur"), (req, res) => {
  // This will be implemented in Week 2
  res.status(200).json({
    status: "success",
    message: "This endpoint will return all investors",
  })
})

export { router as userRouter }
