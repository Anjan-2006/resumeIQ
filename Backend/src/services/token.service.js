const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config/config");
const refreshTokenModel = require("../models/refreshToken.model");
const userModel = require("../models/user.model");

/**
 * Converts a time string (e.g. "15m", "7d", "1h") or number of ms to milliseconds.
 */
function parseDurationToMs(duration, defaultMs) {
  if (typeof duration === "number") return duration;
  if (!duration || typeof duration !== "string") return defaultMs;

  const match = duration.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return defaultMs;

  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return defaultMs;
  }
}

const ACCESS_TOKEN_EXPIRY_MS = parseDurationToMs(config.ACCESS_TOKEN_EXPIRES_IN, 15 * 60 * 1000);
const REFRESH_TOKEN_EXPIRY_MS = parseDurationToMs(config.REFRESH_TOKEN_EXPIRES_IN, 7 * 24 * 60 * 60 * 1000);

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getAccessTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: ACCESS_TOKEN_EXPIRY_MS,
    path: "/",
  };
}

function getRefreshTokenCookieOptions() {
  return {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    maxAge: REFRESH_TOKEN_EXPIRY_MS,
    path: "/api/auth",
  };
}

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  const jti = crypto.randomBytes(16).toString("hex");
  return jwt.sign(
    { id: user._id, jti },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: config.REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * Creates a new access and refresh token session, persists hashed refresh token to MongoDB,
 * and sets httpOnly cookies on the Express response.
 */
async function issueAuthSession(user, res) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await refreshTokenModel.create({
    userId: user._id,
    tokenHash,
    expiresAt,
  });

  res.cookie("accessToken", accessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", refreshToken, getRefreshTokenCookieOptions());

  // Clean up legacy cookie if present
  res.clearCookie("token", { path: "/" });

  return { accessToken, refreshToken };
}

/**
 * Rotates an existing refresh token:
 * 1. Verifies the incoming refresh token JWT.
 * 2. Checks token hash against MongoDB.
 * 3. Detects token reuse (revoking all active sessions if reuse is detected).
 * 4. Issues a new access token and refresh token pair.
 * 5. Marks the old refresh token as revoked and links it to the new token.
 */
async function rotateAuthSession(rawRefreshToken, res) {
  if (!rawRefreshToken) {
    const error = new Error("Refresh token not provided");
    error.status = 401;
    error.code = "REFRESH_TOKEN_MISSING";
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(rawRefreshToken, config.REFRESH_TOKEN_SECRET);
  } catch (err) {
    clearAuthCookies(res);
    const error = new Error(
      err.name === "TokenExpiredError" ? "Refresh token expired" : "Invalid refresh token"
    );
    error.status = 401;
    error.code = err.name === "TokenExpiredError" ? "REFRESH_TOKEN_EXPIRED" : "REFRESH_TOKEN_INVALID";
    throw error;
  }

  const user = await userModel.findById(decoded.id);
  if (!user) {
    clearAuthCookies(res);
    const error = new Error("User associated with token no longer exists");
    error.status = 401;
    error.code = "USER_NOT_FOUND";
    throw error;
  }

  // Prepare replacement token pair and its hash
  const newAccessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const newHash = hashToken(newRefreshToken);
  const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);
  const now = new Date();

  // Atomically consume the existing refresh token and record replacement lineage
  const tokenHash = hashToken(rawRefreshToken);
  const existingRecord = await refreshTokenModel.findOneAndUpdate(
    { tokenHash, revoked: false },
    { $set: { revoked: true, revokedAt: now, replacedByTokenHash: newHash } },
    { returnDocument: "before" }
  );

  if (!existingRecord) {
    const revokedRecord = await refreshTokenModel.findOne({ tokenHash });
    if (revokedRecord) {
      // Lineage-based reuse detection:
      // Look up the direct replacement token if recorded in the lineage.
      const replacementRecord = revokedRecord.replacedByTokenHash
        ? await refreshTokenModel.findOne({ tokenHash: revokedRecord.replacedByTokenHash })
        : null;

      // If the replacement token has already been consumed (revoked: true),
      // the lineage has advanced (e.g. X -> Y -> Z) and presenting X is a definitive replay.
      const isDefinitiveReplay = replacementRecord && replacementRecord.revoked;

      if (!isDefinitiveReplay && revokedRecord.replacedByTokenHash) {
        // Concurrent collision on the same rotation:
        // Preserve the legitimate winning replacement token while revoking any other sessions.
        await refreshTokenModel.updateMany(
          {
            userId: revokedRecord.userId,
            revoked: false,
            tokenHash: { $ne: revokedRecord.replacedByTokenHash },
          },
          { revoked: true, revokedAt: new Date() }
        );
      } else {
        // Genuine reuse/replay: the replacement token was already consumed, or
        // the token was revoked without replacement (e.g. logout).
        // Terminate all active sessions for this user.
        await refreshTokenModel.updateMany(
          { userId: revokedRecord.userId, revoked: false },
          { revoked: true, revokedAt: new Date() }
        );
      }

      clearAuthCookies(res);
      const error = new Error("Refresh token reuse detected. All sessions terminated for security.");
      error.status = 401;
      error.code = "REFRESH_TOKEN_REUSE_DETECTED";
      throw error;
    }

    clearAuthCookies(res);
    const error = new Error("Refresh token record not found");
    error.status = 401;
    error.code = "REFRESH_TOKEN_NOT_FOUND";
    throw error;
  }

  if (new Date() > new Date(existingRecord.expiresAt)) {
    clearAuthCookies(res);
    const error = new Error("Refresh token expired");
    error.status = 401;
    error.code = "REFRESH_TOKEN_EXPIRED";
    throw error;
  }

  // Create new active record
  await refreshTokenModel.create({
    userId: user._id,
    tokenHash: newHash,
    expiresAt: newExpiresAt,
  });

  res.cookie("accessToken", newAccessToken, getAccessTokenCookieOptions());
  res.cookie("refreshToken", newRefreshToken, getRefreshTokenCookieOptions());

  return { user };
}

/**
 * Revokes the session by marking the refresh token record revoked in MongoDB and clearing cookies.
 */
async function revokeAuthSession(rawRefreshToken, res) {
  if (rawRefreshToken) {
    try {
      const tokenHash = hashToken(rawRefreshToken);
      await refreshTokenModel.updateOne(
        { tokenHash },
        { revoked: true, revokedAt: new Date() }
      );
    } catch (err) {
      console.error("Failed to revoke refresh token record:", err);
    }
  }

  clearAuthCookies(res);
}

function clearAuthCookies(res) {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    path: "/api/auth",
  });
  res.clearCookie("token", {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: config.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
}

/**
 * Revokes all active refresh-token sessions belonging to a specific user.
 */
async function revokeAllUserSessions(userId) {
  if (!userId) return;
  await refreshTokenModel.updateMany(
    { userId, revoked: false },
    { $set: { revoked: true, revokedAt: new Date() } }
  );
}

module.exports = {
  hashToken,
  generateAccessToken,
  generateRefreshToken,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
  issueAuthSession,
  rotateAuthSession,
  revokeAuthSession,
  revokeAllUserSessions,
  clearAuthCookies,
};
