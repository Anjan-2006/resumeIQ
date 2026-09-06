const jwt = require("jsonwebtoken");
const config = require("../config/config");

async function authUser(req, res, next) {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Access token not provided",
      code: "TOKEN_MISSING",
    });
  }

  try {
    const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({
      message: "Invalid access token",
      code: "TOKEN_INVALID",
    });
  }
}

module.exports = { authUser };