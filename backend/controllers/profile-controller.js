import User from "../models/user-model.js"

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      })
    }

    res.status(200).json({
      status: "success",
      data: user,
    })
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    })
  }
}

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    // Fields that are not allowed to be updated
    const notAllowed = ["password", "email", "role"]

    // Filter out not allowed fields
    const filteredBody = Object.keys(req.body).reduce((obj, key) => {
      if (!notAllowed.includes(key)) {
        obj[key] = req.body[key]
      }
      return obj
    }, {})

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    }).select("-password")

    res.status(200).json({
      status: "success",
      data: updatedUser,
    })
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    })
  }
}
