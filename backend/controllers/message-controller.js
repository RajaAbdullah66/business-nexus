import Message from "../models/message-model.js"
import User from "../models/user-model.js"
import Connection from "../models/connection-model.js"
import mongoose from "mongoose" // Import mongoose

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

    res.status(201).json({
      status: "success",
      data: message,
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
    await Message.updateMany({ sender: userId, receiver: currentUserId, read: false }, { read: true })

    res.status(200).json({
      status: "success",
      data: messages,
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
            $cond: [{ $eq: ["$sender", mongoose.Types.ObjectId(currentUserId)] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$receiver", mongoose.Types.ObjectId(currentUserId)] }, { $eq: ["$read", false] }],
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
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ])

    res.status(200).json({
      status: "success",
      data: conversations,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}
