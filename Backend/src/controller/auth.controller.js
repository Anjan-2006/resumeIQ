const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const tokenService = require("../services/token.service");
const mailService = require("../services/mail.service");
const crypto = require("crypto");

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp + config.JWT_SECRET).digest("hex");
}

function maskEmail(email) {
  if (!email) return "";
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const maskedName =
    name.length <= 2
      ? name[0] + "*"
      : name[0] + "*".repeat(Math.max(name.length - 2, 1)) + name[name.length - 1];
  return `${maskedName}@${domain}`;
}

// ----------------------------------------------------
// 1. REGISTRATION WITH MANDATORY OTP
// ----------------------------------------------------
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    // Check if an existing verified user already has this email or username
    const existingUser = await userModel.findOne({
      $or: [{ email: cleanEmail }, { username: cleanUsername }],
    });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        message: "An account already exists with this email or username",
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const now = new Date();

    let userToVerify;
    if (existingUser && !existingUser.isVerified) {
      // Re-use existing unverified record
      existingUser.username = cleanUsername;
      existingUser.email = cleanEmail;
      existingUser.password = hashpassword;
      existingUser.otpHash = hashOtp(otp);
      existingUser.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      existingUser.otpAttempts = 0;
      existingUser.otpLastSentAt = now;
      await existingUser.save();
      userToVerify = existingUser;
    } else {
      userToVerify = await userModel.create({
        username: cleanUsername,
        email: cleanEmail,
        password: hashpassword,
        isVerified: false,
        otpHash: hashOtp(otp),
        otpExpiresAt: new Date(now.getTime() + 5 * 60 * 1000),
        otpAttempts: 0,
        otpLastSentAt: now,
      });
    }

    try {
      await mailService.sendOtpEmail({
        email: userToVerify.email,
        otp,
        purpose: "Registration",
      });
    } catch (mailErr) {
      console.error("Failed to send registration OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    const tempToken = jwt.sign(
      { tempUserId: userToVerify._id, type: "REGISTER_OTP_PENDING" },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      otpRequired: true,
      tempToken,
      email: maskEmail(userToVerify.email),
      message: "Verification code sent to your email",
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Unable to process registration" });
  }
}

async function verifyRegistration(req, res) {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ message: "Verification token and 6-digit code are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Verification session expired. Please register again." });
    }

    if (decoded.type !== "REGISTER_OTP_PENDING" || !decoded.tempUserId) {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const user = await userModel.findById(decoded.tempUserId);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No active verification code found. Please request a new code." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.otpAttempts >= 5) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
    }

    const inputHash = hashOtp(otp.trim());
    if (inputHash !== user.otpHash) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        await user.save();
        return res.status(400).json({ message: "Maximum attempts exceeded. Code has been invalidated. Please request a new code." });
      }
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({ message: `Invalid verification code. ${remaining} attempt(s) remaining.` });
    }

    // Success: Activate user, clear OTP, issue standard JWT
    user.isVerified = true;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    await tokenService.issueAuthSession(user, res);

    return res.status(201).json({
      message: "Account verified and registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verify registration error:", err);
    return res.status(500).json({ message: "Unable to verify registration" });
  }
}

async function resendRegistrationOtp(req, res) {
  try {
    const { tempToken } = req.body;
    if (!tempToken) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Verification session expired. Please register again." });
    }

    if (decoded.type !== "REGISTER_OTP_PENDING" || !decoded.tempUserId) {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const user = await userModel.findById(decoded.tempUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    if (user.otpLastSentAt) {
      const elapsedSeconds = (now.getTime() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remainingSeconds = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({ message: `Please wait ${remainingSeconds} seconds before requesting a new code.` });
      }
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await mailService.sendOtpEmail({
        email: user.email,
        otp,
        purpose: "Registration",
      });
    } catch (mailErr) {
      console.error("Failed to resend registration OTP:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    return res.status(200).json({
      message: "New verification code sent to your email",
      email: maskEmail(user.email),
    });
  } catch (err) {
    console.error("Resend registration OTP error:", err);
    return res.status(500).json({ message: "Unable to resend verification code" });
  }
}

// ----------------------------------------------------
// 2. LOGIN WITH MANDATORY OTP
// ----------------------------------------------------
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: cleanEmail });

    // CRITICAL: If user does not exist, has no password, or is not verified -> STOP WITH 401
    if (!user || !user.password || user.isVerified === false) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Credentials verified -> Generate Login OTP
    const otp = generateOtp();
    const now = new Date();

    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await mailService.sendOtpEmail({
        email: user.email,
        otp,
        purpose: "Login",
      });
    } catch (mailErr) {
      console.error("Failed to send login OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    const tempToken = jwt.sign(
      { tempUserId: user._id, type: "LOGIN_OTP_PENDING" },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      otpRequired: true,
      tempToken,
      email: maskEmail(user.email),
      message: "Verification code sent to your email",
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Unable to process login" });
  }
}

async function verifyLogin(req, res) {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ message: "Verification token and 6-digit code are required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Verification session expired. Please sign in again." });
    }

    if (decoded.type !== "LOGIN_OTP_PENDING" || !decoded.tempUserId) {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const user = await userModel.findById(decoded.tempUserId);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No active verification code found. Please request a new code." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.otpAttempts >= 5) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
    }

    const inputHash = hashOtp(otp.trim());
    if (inputHash !== user.otpHash) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        await user.save();
        return res.status(400).json({ message: "Maximum attempts exceeded. Code has been invalidated. Please request a new code." });
      }
      await user.save();
      const remaining = 5 - user.otpAttempts;
      return res.status(400).json({ message: `Invalid verification code. ${remaining} attempt(s) remaining.` });
    }

    // Success: Clear OTP, issue standard 1-day JWT cookie
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    await tokenService.issueAuthSession(user, res);

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Verify login error:", err);
    return res.status(500).json({ message: "Unable to verify code" });
  }
}

async function resendLoginOtp(req, res) {
  try {
    const { tempToken } = req.body;
    if (!tempToken) {
      return res.status(400).json({ message: "Verification token is required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    if (decoded.type !== "LOGIN_OTP_PENDING" || !decoded.tempUserId) {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const user = await userModel.findById(decoded.tempUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    if (user.otpLastSentAt) {
      const elapsedSeconds = (now.getTime() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remainingSeconds = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({ message: `Please wait ${remainingSeconds} seconds before requesting a new code.` });
      }
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await mailService.sendOtpEmail({
        email: user.email,
        otp,
        purpose: "Login",
      });
    } catch (mailErr) {
      console.error("Failed to resend login OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    return res.status(200).json({
      message: "New verification code sent to your email",
      email: maskEmail(user.email),
    });
  } catch (err) {
    console.error("Resend login OTP error:", err);
    return res.status(500).json({ message: "Unable to resend verification code" });
  }
}

// ----------------------------------------------------
// 3. GUEST LOGIN, LOGOUT & ME
// ----------------------------------------------------
async function guestLogin(req, res) {
  try {
    const guestIdentifier = crypto.randomBytes(12).toString("hex");
    const guestUser = await userModel.create({
      username: `Guest Demo ${guestIdentifier}`,
      email: `guest-${guestIdentifier}@resumeiq.local`,
      password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
      isGuest: true,
      isVerified: true,
    });

    await tokenService.issueAuthSession(guestUser, res);
    return res.status(200).json({
      message: "guest user logged in successfully",
      user: {
        id: guestUser._id,
        username: guestUser.username,
        email: guestUser.email,
        isGuest: true,
      },
    });
  } catch (err) {
    console.error("Guest login error:", err);
    return res.status(500).json({ message: "Unable to start guest demo" });
  }
}

async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;
  await tokenService.revokeAuthSession(refreshToken, res);
  return res.status(200).json({
    message: "user logged out successfully",
  });
}

async function refresh(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { user } = await tokenService.rotateAuthSession(refreshToken, res);

    return res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: Boolean(user.isGuest),
      },
    });
  } catch (err) {
    return res.status(err.status || 401).json({
      message: err.message || "Failed to refresh session",
      code: err.code || "REFRESH_FAILED",
    });
  }
}

async function getMe(req, res) {
  const user = await userModel.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.status(200).json({
    message: `Details of the ${user.username}`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isGuest: Boolean(user.isGuest),
      hasPassword: Boolean(user.password),
    },
  });
}

async function updateProfile(req, res) {
  try {
    const { username } = req.body;

    if (!username || typeof username !== "string") {
      return res.status(400).json({ message: "A valid name is required." });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2 || trimmedUsername.length > 50) {
      return res.status(400).json({ message: "Name must be between 2 and 50 characters." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if another user already has this username
    const existing = await userModel.findOne({
      username: trimmedUsername,
      _id: { $ne: user._id },
    });
    if (existing) {
      return res.status(400).json({ message: "This name is already taken. Please choose another." });
    }

    user.username = trimmedUsername;
    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isGuest: Boolean(user.isGuest),
        hasPassword: Boolean(user.password),
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    return res.status(500).json({ message: "Unable to update profile. Please try again." });
  }
}

async function initiatePasswordChange(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All password fields are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match." });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ message: "New password must be different from the current password." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This account is authenticated via Google OAuth and does not use a local password.",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    // Hash pending new password to include inside temporary JWT token
    const pendingPasswordHash = await bcrypt.hash(newPassword, 10);
    const otp = generateOtp();
    const now = new Date();

    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await mailService.sendOtpEmail({
        email: user.email,
        otp,
        purpose: "Password Change",
      });
    } catch (mailErr) {
      console.error("Failed to send password change OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    const tempToken = jwt.sign(
      { tempUserId: user._id, type: "PASSWORD_CHANGE_OTP_PENDING", pendingPasswordHash },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      otpRequired: true,
      tempToken,
      email: maskEmail(user.email),
      message: "Verification code sent to your email",
    });
  } catch (err) {
    console.error("Initiate password change error:", err);
    return res.status(500).json({ message: "Unable to process password change. Please try again." });
  }
}

async function verifyPasswordChange(req, res) {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({ message: "Verification token and 6-digit code are required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Verification session expired. Please request a new code." });
    }

    if (decoded.type !== "PASSWORD_CHANGE_OTP_PENDING" || !decoded.tempUserId || !decoded.pendingPasswordHash) {
      return res.status(400).json({ message: "Invalid verification session." });
    }

    if (decoded.tempUserId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized verification request." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "No active verification code found. Please request a new code." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.otpAttempts >= 5) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
    }

    const inputHash = hashOtp(otp.toString().trim());
    if (inputHash !== user.otpHash) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        message: `Invalid verification code. ${5 - user.otpAttempts} attempts remaining.`,
      });
    }

    // Apply the pending password hash
    user.password = decoded.pendingPasswordHash;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    return res.status(200).json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    console.error("Verify password change error:", err);
    return res.status(500).json({ message: "Unable to verify code and change password." });
  }
}

async function resendPasswordChangeOtp(req, res) {
  try {
    const { tempToken } = req.body;
    if (!tempToken) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Session expired. Please start over." });
    }

    if (decoded.type !== "PASSWORD_CHANGE_OTP_PENDING" || !decoded.tempUserId || !decoded.pendingPasswordHash) {
      return res.status(400).json({ message: "Invalid verification session." });
    }

    if (decoded.tempUserId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Unauthorized request." });
    }

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const now = new Date();
    if (user.otpLastSentAt) {
      const elapsedSeconds = (now.getTime() - new Date(user.otpLastSentAt).getTime()) / 1000;
      if (elapsedSeconds < 60) {
        const remainingSeconds = Math.ceil(60 - elapsedSeconds);
        return res.status(429).json({ message: `Please wait ${remainingSeconds} seconds before requesting a new code.` });
      }
    }

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = now;
    await user.save();

    try {
      await mailService.sendOtpEmail({
        email: user.email,
        otp,
        purpose: "Password Change",
      });
    } catch (mailErr) {
      console.error("Failed to resend password change OTP email:", mailErr);
      return res.status(500).json({ message: "Failed to send verification email. Please try again." });
    }

    const newTempToken = jwt.sign(
      { tempUserId: user._id, type: "PASSWORD_CHANGE_OTP_PENDING", pendingPasswordHash: decoded.pendingPasswordHash },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      message: "New verification code sent to your email.",
      tempToken: newTempToken,
      email: maskEmail(user.email),
    });
  } catch (err) {
    console.error("Resend password change OTP error:", err);
    return res.status(500).json({ message: "Unable to resend verification code." });
  }
}

// ----------------------------------------------------
// 4. GOOGLE OAUTH
// ----------------------------------------------------
async function googleAuthSuccess(req, res) {
  try {
    if (!req.user) {
      return res.redirect(`${config.FRONTEND_URL}/login?error=authentication_failed`);
    }

    const user = req.user;
    await tokenService.issueAuthSession(user, res);

    return res.redirect(`${config.FRONTEND_URL}/`);
  } catch (err) {
    console.error("Google auth callback error:", err);
    return res.redirect(`${config.FRONTEND_URL}/login?error=server_error`);
  }
}

async function googleAuthFailure(req, res) {
  return res.redirect(`${config.FRONTEND_URL}/login?error=oauth_denied`);
}

// ----------------------------------------------------
// 5. FORGOT PASSWORD (EMAIL OTP & SECURE RESET)
// ----------------------------------------------------
const GENERIC_FORGOT_PW_MESSAGE = "If an account exists with this email, a verification code has been sent.";

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: cleanEmail });

    if (user && user.isVerified) {
      const now = new Date();
      // Enforce 60-second resend cooldown silently to prevent enumeration
      if (user.otpLastSentAt) {
        const elapsedSeconds = (now.getTime() - new Date(user.otpLastSentAt).getTime()) / 1000;
        if (elapsedSeconds < 60) {
          return res.status(200).json({ message: GENERIC_FORGOT_PW_MESSAGE });
        }
      }

      const otp = generateOtp();
      user.otpHash = hashOtp(otp);
      user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      user.otpAttempts = 0;
      user.otpLastSentAt = now;
      await user.save();

      try {
        await mailService.sendOtpEmail({
          email: user.email,
          otp,
          purpose: "Password Reset",
        });
      } catch (mailErr) {
        console.error("Failed to send forgot-password OTP email:", mailErr);
      }
    }

    // Always return a generic response to prevent email enumeration
    return res.status(200).json({ message: GENERIC_FORGOT_PW_MESSAGE });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
}

async function verifyForgotPassword(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and verification code are required." });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: cleanEmail });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ message: "Invalid or expired verification code. Please request a new code." });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Verification code has expired. Please request a new one." });
    }

    if (user.otpAttempts >= 5) {
      user.otpHash = null;
      user.otpExpiresAt = null;
      await user.save();
      return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
    }

    const inputHash = hashOtp(otp.toString().trim());
    if (inputHash !== user.otpHash) {
      user.otpAttempts += 1;
      if (user.otpAttempts >= 5) {
        user.otpHash = null;
        user.otpExpiresAt = null;
        await user.save();
        return res.status(400).json({ message: "Maximum verification attempts exceeded. Please request a new code." });
      }
      await user.save();
      return res.status(400).json({
        message: `Invalid verification code. ${5 - user.otpAttempts} attempt(s) remaining.`,
      });
    }

    // Success: invalidate OTP so it cannot be reused
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    // Generate single-use password reset token with claim type PASSWORD_RESET_OTP_VERIFIED
    const pwdCheck = user.password
      ? crypto.createHash("sha256").update(user.password).digest("hex").slice(0, 16)
      : "none";

    const tempToken = jwt.sign(
      {
        userId: user._id,
        type: "PASSWORD_RESET_OTP_VERIFIED",
        pwdCheck,
      },
      config.JWT_SECRET,
      { expiresIn: "5m" }
    );

    return res.status(200).json({
      message: "OTP verified successfully",
      tempToken,
    });
  } catch (err) {
    console.error("Verify forgot password error:", err);
    return res.status(500).json({ message: "Unable to verify code. Please try again." });
  }
}

async function resetPassword(req, res) {
  try {
    const { tempToken, newPassword } = req.body;
    if (!tempToken || !newPassword) {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, config.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Password reset session has expired or is invalid. Please start over." });
    }

    if (decoded.type !== "PASSWORD_RESET_OTP_VERIFIED" || !decoded.userId) {
      return res.status(400).json({ message: "Invalid password reset token." });
    }

    const user = await userModel.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Verify token single-use (current password hash prefix must match token payload)
    const currentPwdCheck = user.password
      ? crypto.createHash("sha256").update(user.password).digest("hex").slice(0, 16)
      : "none";

    if (decoded.pwdCheck !== currentPwdCheck) {
      return res.status(400).json({ message: "This password reset token has already been used or is invalid." });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otpHash = null;
    user.otpExpiresAt = null;
    user.otpAttempts = 0;
    await user.save();

    // Revoke ALL existing refresh-token sessions for this user
    await tokenService.revokeAllUserSessions(user._id);

    // Issue a fresh authenticated session so the user is directly logged in
    // without having to re-authenticate and re-enter email OTP immediately
    await tokenService.issueAuthSession(user, res);

    return res.status(200).json({
      message: "Password reset successfully.",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Unable to reset password. Please try again." });
  }
}

async function resendForgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await userModel.findOne({ email: cleanEmail });

    if (user && user.isVerified) {
      const now = new Date();
      if (user.otpLastSentAt) {
        const elapsedSeconds = (now.getTime() - new Date(user.otpLastSentAt).getTime()) / 1000;
        if (elapsedSeconds < 60) {
          // Cooldown active: return generic response silently without sending another email
          return res.status(200).json({ message: GENERIC_FORGOT_PW_MESSAGE });
        }
      }

      const otp = generateOtp();
      user.otpHash = hashOtp(otp);
      user.otpExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);
      user.otpAttempts = 0;
      user.otpLastSentAt = now;
      await user.save();

      try {
        await mailService.sendOtpEmail({
          email: user.email,
          otp,
          purpose: "Password Reset",
        });
      } catch (mailErr) {
        console.error("Failed to resend forgot-password OTP email:", mailErr);
      }
    }

    // Always generic response to prevent email enumeration
    return res.status(200).json({ message: GENERIC_FORGOT_PW_MESSAGE });
  } catch (err) {
    console.error("Resend forgot password error:", err);
    return res.status(500).json({ message: "An error occurred. Please try again later." });
  }
}

module.exports = {
  register,
  verifyRegistration,
  resendRegistrationOtp,
  login,
  verifyLogin,
  resendLoginOtp,
  guestLogin,
  refresh,
  logout,
  getMe,
  updateProfile,
  initiatePasswordChange,
  verifyPasswordChange,
  resendPasswordChangeOtp,
  googleAuthSuccess,
  googleAuthFailure,
  forgotPassword,
  verifyForgotPassword,
  resetPassword,
  resendForgotPassword,
};