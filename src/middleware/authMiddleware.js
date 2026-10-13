const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    // Accept bearer tokens for API clients and HttpOnly cookies for browser sessions.
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    const token = bearerToken || req.cookies?.authToken;

    if (!token) {
      return res.status(401).json({ message: "Authentication required. Please log in." });
    }
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      return res.status(500).json({ message: "Server authentication configuration is invalid." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "task3-authentication-system",
      audience: "task3-client"
    });

    const user = await User.findById(decoded.sub).select("_id username email createdAt +tokenVersion");
    if (!user || decoded.tokenVersion !== (user.tokenVersion || 0)) {
      return res.status(401).json({ message: "Session is no longer valid. Please log in again." });
    }

    req.user = user;
    req.authToken = token;
    next();
  } catch (_error) {
    return res.status(401).json({ message: "Your session is invalid or expired. Please log in again." });
  }
}

module.exports = { protect };
