const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
    minlength: [3, "Username must contain at least 3 characters"],
    maxlength: [30, "Username must be 30 characters or fewer"],
    match: [/^[a-zA-Z0-9_]+$/, "Username may contain letters, numbers and underscores only"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"]
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  // Incremented on logout to invalidate previously issued JWTs for this account.
  tokenVersion: { type: Number, default: 0, select: false }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
