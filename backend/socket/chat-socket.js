// socket/chat-socket.js
import Message from "../models/message-model.js"
import User from "../models/user-model.js"
import Connection from "../models/connection-model.js"

export const handleChatEvents = (socket, io) => {
  // Handle typing event
  socket.on("typing", async (data) => {
    try {
      const { receiverId, isTyping } = data
      
      // Check if there's an accepted connection
      const connection = await Connection.findOne({
        $or: [
          { sender: socket.user.id, receiver: receiverId },
          { sender: receiverId, receiver: socket.user.id }
        ],
        status: "accepted"
      })
      
      if (!connection) {
        return socket.emit("error", { message: "You can only message users you are connected with" })
      }
      
      // Emit typing status to receiver
      io.to(receiverId).emit("typing", {
        userId: socket.user.id,
        isTyping
      })
    } catch (error) {
      console.error("Error in typing event:", error)
      socket.emit("error", { message: "Failed to send typing status" })
    }
  })
  
  // Handle sending messages
  socket.on("message", async (data) => {
    try {
      const { content, receiverId } = data
      
      // Check if receiver exists
      const receiver = await User.findById(receiverId)
      if (!receiver) {
        return socket.emit("error", { message: "Receiver not found" })
      }
      
      // Check if there's an accepted connection
      const connection = await Connection.findOne({
        $or: [
          { sender: socket.user.id, receiver: receiverId },
          { sender: receiverId, receiver: socket.user.id }
        ],
        status: "accepted"
      })
      
      if (!connection) {
        return socket.emit("error", { message: "You can only message users you are connected with" })
      }
      
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
  
  // Mark messages as read
  socket.on("markAsRead", async (data) => {
    try {
      const { senderId } = data
      
      // Update all unread messages from sender to current user
      await Message.updateMany(
        {
          sender: senderId,
          receiver: socket.user.id,
          read: false
        },
        {
          read: true
        }
      )
      
      // Notify sender that messages have been read
      io.to(senderId).emit("messagesRead", {
        userId: socket.user.id
      })
    } catch (error) {
      console.error("Error in markAsRead event:", error)
      socket.emit("error", { message: "Failed to mark messages as read" })
    }
  })
}