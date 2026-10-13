const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const createToken = require("../utils/createToken");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 1000,
  path: "/"
});

function publicUser(user) {
  return { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt };
}

async function register(req, res, next) {
  try {
    let { username, email, password } = req.body || {};
    if (typeof username !== "string" || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Username, email and password are required." });
    }

    username = username.trim();
    email = email.trim().toLowerCase();

    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ message: "Username must be 3–30 characters and use letters, numbers or underscores." });
    }
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 8 || password.length > 72) {
      return res.status(400).json({ message: "Password must be between 8 and 72 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "An account with this email already exists." });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ username, email, password: hashedPassword });
    const token = createToken(user._id.toString(), user.tokenVersion || 0);

    res.cookie("authToken", token, cookieOptions());
    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "An account with this email already exists." });
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    // Keep the response generic to avoid disclosing whether an email is registered.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken(user._id.toString(), user.tokenVersion || 0);
    res.cookie("authToken", token, cookieOptions());
    return res.json({ message: "Login successful.", token, user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    // Increment tokenVersion so any JWT previously issued to this account is rejected.
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = bearerToken || req.cookies?.authToken;
    if (token && process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          issuer: "task3-authentication-system",
          audience: "task3-client"
        });
        await User.findByIdAndUpdate(decoded.sub, { $inc: { tokenVersion: 1 } });
      } catch (_invalidToken) {
        // Logout remains safe/idempotent if the token is already expired or invalid.
      }
    }
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/"
    });
    return res.json({ message: "Logged out successfully. The issued token has been invalidated." });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, logout };
