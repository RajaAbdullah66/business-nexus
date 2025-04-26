import Connection from "../models/connection-model.js"
import User from "../models/user-model.js"

// Send a connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId, message } = req.body
    const senderId = req.user.id

    // Check if receiver exists
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({
        status: "fail",
        message: "Receiver not found",
      })
    }

    // Check if a connection request already exists
    const existingConnection = await Connection.findOne({
      sender: senderId,
      receiver: receiverId,
    })

    if (existingConnection) {
      return res.status(400).json({
        status: "fail",
        message: "Connection request already exists",
      })
    }

    // Create new connection request
    const connection = await Connection.create({
      sender: senderId,
      receiver: receiverId,
      message,
    })

    res.status(201).json({
      status: "success",
      data: connection,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Get all connection requests for the current user
export const getConnectionRequests = async (req, res) => {
  try {
    const userId = req.user.id

    // Get received requests
    const receivedRequests = await Connection.find({ receiver: userId })
      .populate("sender", "name email role")
      .sort("-createdAt")

    // Get sent requests
    const sentRequests = await Connection.find({ sender: userId })
      .populate("receiver", "name email role")
      .sort("-createdAt")

    res.status(200).json({
      status: "success",
      data: {
        received: receivedRequests,
        sent: sentRequests,
      },
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}

// Accept or reject a connection request
export const updateConnectionStatus = async (req, res) => {
  try {
    const { connectionId } = req.params
    const { status } = req.body
    const userId = req.user.id

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        status: "fail",
        message: "Status must be either 'accepted' or 'rejected'",
      })
    }

    // Find the connection request
    const connection = await Connection.findById(connectionId)

    if (!connection) {
      return res.status(404).json({
        status: "fail",
        message: "Connection request not found",
      })
    }

    // Check if the current user is the receiver of the request
    if (connection.receiver.toString() !== userId) {
      return res.status(403).json({
        status: "fail",
        message: "You are not authorized to update this connection request",
      })
    }

    // Update the connection status
    connection.status = status
    await connection.save()

    res.status(200).json({
      status: "success",
      data: connection,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}
