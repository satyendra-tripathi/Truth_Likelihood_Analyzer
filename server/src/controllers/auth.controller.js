import validator from "validator";
import User from "../models/User.js";
import { signToken } from "../utils/token.js";

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email });

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Enter a valid email" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ name, email, password });
    res.status(201).json({ user: publicUser(user), token: signToken(user._id) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({ user: publicUser(user), token: signToken(user._id) });
  } catch (error) {
    next(error);
  }
};
