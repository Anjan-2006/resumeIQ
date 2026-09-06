const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: [true, "username must be unique"],
    required: [true, "username is required"],
    trim: true,
  },
  email: {
    type: String,
    unique: [true, "email must be unique"],
    required: [true, "email is required"],
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
  },
  isGuest: {
    type: Boolean,
    default: false,
    index: true,
  },
  guestReportGenerations: {
    type: Number,
    default: 0,
    min: 0,
  },
  guestResumeGenerations: {
    type: Number,
    default: 0,
    min: 0,
  },
  isVerified: {
    type: Boolean,
    default: true,
    index: true,
  },
  otpHash: {
    type: String,
    default: null,
  },
  otpExpiresAt: {
    type: Date,
    default: null,
  },
  otpAttempts: {
    type: Number,
    default: 0,
  },
  otpLastSentAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;
