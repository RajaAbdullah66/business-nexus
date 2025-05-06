// utils/jwt-utils.js
import jwt from "jsonwebtoken"

// Generate JWT token
export const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "30d" }
  )
}

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
  } catch (error) {
    throw new Error("Invalid token or token expired")
  }
}