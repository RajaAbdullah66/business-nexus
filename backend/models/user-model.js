import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ["entrepreneur", "investor"],
      required: [true, "Please specify your role"],
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    // Entrepreneur specific fields
    startup: {
      type: String,
      default: "",
    },
    startupDescription: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    fundingNeeded: {
      type: String,
      default: "",
    },
    foundedYear: {
      type: String,
      default: "",
    },
    // Investor specific fields
    company: {
      type: String,
      default: "",
    },
    investmentInterests: {
      type: String,
      default: "",
    },
    investmentRange: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was modified
  if (!this.isModified("password")) return next()

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Method to check if password is correct
userSchema.methods.correctPassword = async (candidatePassword, userPassword) =>
  await bcrypt.compare(candidatePassword, userPassword)

const User = mongoose.model("User", userSchema)

export default User
