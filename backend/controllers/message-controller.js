// controllers/message-controller.js
import Message from "../models/message-model.js"
import User from "../models/user-model.js"
import Connection from "../models/connection-model.js"
import mongoose from "mongoose"

// Send a message
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body
    const senderId = req.user.id

    // Check if receiver exists
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({
        status: "fail",
        message: "Receiver not found",
      })
    }

    // Check if there's an accepted connection between sender and receiver
    const connection = await Connection.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      status: "accepted",
    })

    if (!connection) {
      return res.status(403).json({
        status: "fail",
        message: "You can only message users you are connected with",
      })
    }

    // Create new message
    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content,
    })

    // Populate sender and receiver info
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email role")
      .populate("receiver", "name email role")

    // Format message for response
    const formattedMessage = {
      id: populatedMessage._id,
      content: populatedMessage.content,
      sender: {
        id: populatedMessage.sender._id,
        name: populatedMessage.sender.name,
        email: populatedMessage.sender.email,
        role: populatedMessage.sender.role,
      },
      receiver: {
        id: populatedMessage.receiver._id,
        name: populatedMessage.receiver.name,
        email: populatedMessage.receiver.email,
        role: populatedMessage.receiver.role,
      },
      createdAt: populatedMessage.createdAt,
      read: populatedMessage.read,
    }

    // Emit socket event if socket.io is available
    if (req.app.get("io")) {
      req.app.get("io").to(receiverId).emit("message", formattedMessage)
    }

    res.status(201).json({
      status: "success",
      data: formattedMessage,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Get conversation with a specific user
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      })
    }

    // Get messages between current user and the specified user
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .sort("createdAt")
      .populate("sender", "name email role")
      .populate("receiver", "name email role")

    // Mark messages as read if current user is the receiver
    await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true, readAt: Date.now() }
    )

    // Format messages for response
    const formattedMessages = messages.map(message => ({
      id: message._id,
      content: message.content,
      sender: {
        id: message.sender._id,
        name: message.sender.name,
        email: message.sender.email,
        role: message.sender.role,
      },
      receiver: {
        id: message.receiver._id,
        name: message.receiver.name,
        email: message.receiver.email,
        role: message.receiver.role,
      },
      createdAt: message.createdAt,
      read: message.read,
    }))

    // Emit socket event if socket.io is available
    if (req.app.get("io")) {
      req.app.get("io").to(userId).emit("messagesRead", {
        userId: currentUserId,
      })
    }

    res.status(200).json({
      status: "success",
      data: formattedMessages,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Get all conversations for the current user
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user.id

    // Get all users the current user has exchanged messages with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: mongoose.Types.ObjectId(currentUserId) },
            { receiver: mongoose.Types.ObjectId(currentUserId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", mongoose.Types.ObjectId(currentUserId)] },
              "$receiver",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", mongoose.Types.ObjectId(currentUserId)] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            isOnline: 1,
            lastActive: 1,
          },
          lastMessage: {
            _id: 1,
            content: 1,
            createdAt: 1,
            sender: 1,
            receiver: 1,
            read: 1,
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ])

    // Format conversations for response
    const formattedConversations = conversations.map(conv => ({
      id: conv._id,
      user: {
        id: conv.user._id,
        name: conv.user.name,
        email: conv.user.email,
        role: conv.user.role,
        isOnline: conv.user.isOnline,
        lastActive: conv.user.lastActive,
      },
      lastMessage: {
        id: conv.lastMessage._id,
        content: conv.lastMessage.content,
        createdAt: conv.lastMessage.createdAt,
        sender: conv.lastMessage.sender.toString(),
        receiver: conv.lastMessage.receiver.toString(),
        read: conv.lastMessage.read,
      },
      unreadCount: conv.unreadCount,
    }))

    res.status(200).json({
      status: "success",
      data: formattedConversations,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params
    const currentUserId = req.user.id

    // Update all unread messages from the specified user to current user
    const result = await Message.updateMany(
      { sender: userId, receiver: currentUserId, read: false },
      { read: true, readAt: Date.now() }
    )

    // Emit socket event if socket.io is available
    if (req.app.get("io")) {
      req.app.get("io").to(userId).emit("messagesRead", {
        userId: currentUserId,
      })
    }

    res.status(200).json({
      status: "success",
      message: "Messages marked as read",
      count: result.nModified,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}