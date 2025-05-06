// controllers/auth-controller.js
import jwt from "jsonwebtoken"
import User from "../models/user-model.js"

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  })
}

// Create and send token response
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  // Remove password from output
  user.password = undefined

  res.status(statusCode).json({
    status: "success",
    token,
    user,
  })
}

// Register a new user
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists with this email",
      })
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      isOnline: true,
      lastActive: Date.now()
    })

    // Generate token and send response
    createSendToken(newUser, 201, res)
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide email and password",
      })
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select("+password")

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Incorrect email or password",
      })
    }

    // Update user's online status
    user.isOnline = true
    user.lastActive = Date.now()
    await user.save({ validateBeforeSave: false })

    // If everything ok, send token to client
    createSendToken(user, 200, res)
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    // Get user from collection
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      })
    }

    res.status(200).json({
      status: "success",
      user,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Logout user
export const logout = async (req, res) => {
  try {
    // Update user's online status
    await User.findByIdAndUpdate(req.user.id, {
      isOnline: false,
      lastActive: Date.now()
    })

    res.status(200).json({
      status: "success",
      message: "Logged out successfully"
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}
