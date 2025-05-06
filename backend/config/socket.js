// config/socket.js
import jwt from "jsonwebtoken"
import User from "../models/user-model.js"
import Message from "../models/message-model.js"

export const configureSocket = (io) => {
  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error("Authentication error: Token not provided"))
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      
      // Get user from database
      const user = await User.findById(decoded.id)
      if (!user) {
        return next(new Error("Authentication error: User not found"))
      }
      
      // Attach user to socket
      socket.user = {
        id: user._id.toString(),
        name: user.name,
        role: user.role
      }
      
      next()
    } catch (error) {
      return next(new Error("Authentication error: Invalid token"))
    }
  })

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.id}`)
    
    // Update user's online status
    updateUserStatus(socket.user.id, true)
    
    // Join user to their own room for private messages
    socket.join(socket.user.id)
    
    // Handle user joining
    socket.on("join", async () => {
      try {
        // Broadcast to all clients that this user is online
        socket.broadcast.emit("online", {
          userId: socket.user.id,
          isOnline: true
        })
      } catch (error) {
        console.error("Error in join event:", error)
      }
    })
    
    // Handle typing event
    socket.on("typing", async (data) => {
      try {
        const { receiverId, isTyping } = data
        
        // Emit typing status to receiver
        io.to(receiverId).emit("typing", {
          userId: socket.user.id,
          isTyping
        })
      } catch (error) {
        console.error("Error in typing event:", error)
      }
    })
    
    // Handle sending messages
    socket.on("message", async (data) => {
      try {
        const { content, receiverId } = data
        
        // Create and save message
        const message = new Message({
          sender: socket.user.id,
          receiver: receiverId,
          content,
          read: false
        })
        
        await message.save()
        
        // Populate sender and receiver info
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name email role")
          .populate("receiver", "name email role")
        
        // Format message for client
        const formattedMessage = {
          id: populatedMessage._id,
          content: populatedMessage.content,
          sender: {
            id: populatedMessage.sender._id,
            name: populatedMessage.sender.name
          },
          receiver: {
            id: populatedMessage.receiver._id,
            name: populatedMessage.receiver.name
          },
          createdAt: populatedMessage.createdAt,
          read: populatedMessage.read
        }
        
        // Send message to both sender and receiver
        io.to(receiverId).emit("message", formattedMessage)
        socket.emit("message", formattedMessage)
      } catch (error) {
        console.error("Error in message event:", error)
        socket.emit("error", { message: "Failed to send message" })
      }
    })
    
    // Handle user leaving
    socket.on("leave", async () => {
      try {
        // Update user's online status
        await updateUserStatus(socket.user.id, false)
        
        // Broadcast to all clients that this user is offline
        socket.broadcast.emit("online", {
          userId: socket.user.id,
          isOnline: false
        })
      } catch (error) {
        console.error("Error in leave event:", error)
      }
    })
    
    // Handle disconnection
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.user.id}`)
      
      try {
        // Update user's online status
        await updateUserStatus(socket.user.id, false)
        
        // Broadcast to all clients that this user is offline
        socket.broadcast.emit("online", {
          userId: socket.user.id,
          isOnline: false
        })
      } catch (error) {
        console.error("Error in disconnect event:", error)
      }
    })
  })
}

// Helper function to update user's online status
const updateUserStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastActive: Date.now()
    })
  } catch (error) {
    console.error("Error updating user status:", error)
  }
}