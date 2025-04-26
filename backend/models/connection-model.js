import mongoose from "mongoose"

const connectionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
)

// Ensure a user can't send multiple requests to the same receiver
connectionSchema.index({ sender: 1, receiver: 1 }, { unique: true })

const Connection = mongoose.model("Connection", connectionSchema)

export default Connection
