import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { AT_LIFE, RT_LIFE } from "../config/env.js";
import userSchema from "../models/userSchema.js";

export const verifySession = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { iat, exp, ...rest } = decoded;
    req.user = rest;
    next();
  } catch (error) {
    console.log("Error occurred while verifying session:", error);
    res.status(403).send("Forbidden");
  }
};
export const refreshSession = async (req, res, next) => {
  const token = req.cookies.refresh_token;
  if (!token) {
    return res.status(401).send("Unauthorized");
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const { iat, exp, ...rest } = decoded;
    const refresh_token = jwt.sign(rest, JWT_SECRET, { expiresIn: RT_LIFE });
    const access_token = jwt.sign(rest, JWT_SECRET, { expiresIn: AT_LIFE });
    await userSchema.updateOne({ _id: rest.id }, { $push: { refresh_token } });
    res.cookie("refresh_token", refresh_token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    });
    res.status(200).json({ msg: "refresh successful", access: access_token });
  } catch (error) {
    console.log("Error occurred while verifying session:", error);
    res.status(403).send("Forbidden");
  }
};
