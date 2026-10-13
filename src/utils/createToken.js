const jwt = require("jsonwebtoken");

function createToken(userId, tokenVersion = 0) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be set to a random string of at least 32 characters.");
  }
  return jwt.sign({ sub: userId, tokenVersion }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    issuer: "task3-authentication-system",
    audience: "task3-client"
  });
}

module.exports = createToken;
