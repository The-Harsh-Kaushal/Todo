import userSchema from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AT_LIFE, RT_LIFE, JWT_SECRET, SALT_ROUNDS } from "../config/env.js";

const loginMiddleware = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Identifier and password are required");
  }
  try {
    const user = await userSchema.findOne({ email }).select("-refresh_token");
    if (!user) {
      return res.status(400).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }
    const payload = { email: user.email, name: user.name, id: user._id };
    const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: RT_LIFE });
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: AT_LIFE });

    res.cookie("refresh_token", refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    res.status(200).json({ msg: "Login successful", access: access_token });
  } catch (error) {
    console.log("Error occurred during login:", error);
    res.status(500).send("Internal Server Error");
  }
};
const signupMiddleware = async (req, res, next) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    return res.status(400).send("All fields are required");
  }
  try {
    const conflict = await userSchema.findOne({ email });
    if (conflict) {
      return res.status(400).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newUser = new userSchema({ email, password: hashedPassword, name });
    const payload = { id: newUser._id, email, name };
    const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: RT_LIFE });
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: AT_LIFE });
    newUser.refresh_token.push(refresh_token);
    await newUser.save();

    res.cookie("refresh_token", refresh_token, {

      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    res.status(201).json({ msg: "Signup successful", access: access_token });
    next();
  } catch (error) {
    console.log("Error occurred during signup:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default { loginMiddleware, signupMiddleware };
