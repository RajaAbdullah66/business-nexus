// middleware/error-middleware.js
export const errorMiddleware = (err, req, res, next) => {
    console.error(err.stack)
    
    // Default error status and message
    const statusCode = err.statusCode || 500
    const message = err.message || "Something went wrong"
    
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(val => val.message)
      return res.status(400).json({
        status: "fail",
        message: errors.join(", ")
      })
    }
    
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0]
      return res.status(400).json({
        status: "fail",
        message: `Duplicate field value: ${field}. Please use another value.`
      })
    }
    
    // JWT errors
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "fail",
        message: "Invalid token. Please log in again."
      })
    }
    
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Your token has expired. Please log in again."
      })
    }
    
    // Send error response
    res.status(statusCode).json({
      status: statusCode >= 500 ? "error" : "fail",
      message
    })
  }