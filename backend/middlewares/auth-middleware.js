import jwt from "jsonwebtoken"
import User from "../models/user-model.js"

// Protect routes - only authenticated users can access
export const protect = async (req, res, next) => {
  try {
    let token

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please log in to get access.",
      })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")

    // Check if user still exists
    const currentUser = await User.findById(decoded.id)
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token no longer exists.",
      })
    }

    // Grant access to protected route
    req.user = currentUser
    next()
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Invalid token or token expired",
    })
  }
}

// Restrict to certain roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      })
    }
    next()
  }
}
