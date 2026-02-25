import { JWT_SECRET, SALT_ROUNDS } from "../config/env.js";
import userSchema from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/send_email.js";
import { forgot_pass_html } from "../view/forgot_pass_html.js";
import util from "util";
import mongoose from "mongoose";
import boardSchema from "../models/boardSchema.js";
import listSchema from "../models/listSchema.js";
import taskSchema from "../models/taskSchema.js";
import commentSchema from "../models/commentSchema.js";
const verifyAsync = util.promisify(jwt.verify);
const logout = async (req, res, next) => {
  const { id } = req.user;
  const token = req.cookies.refresh_token;
  try {
    const user = await userSchema.findById(id);
    const index = user.refresh_token.findIndex((value) => value == token);
    user.refresh_token.splice(index, 1);
    await user.save();
  } catch (err) {
    console.log(err);
  }
  res.clearCookie("refresh_token");
  res.status(200).json({ msg: "Logout successful" });
};
const getProfiles = async (req, res, next) => {
  const { word } = req.query;
  if (!word) return res.status(200).json({ profiles: [] });
  const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  try {
    const users = await userSchema.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: escapedWord, $options: "i" } },
            { email: { $regex: escapedWord, $options: "i" } },
          ],
        },
      },
      { $limit: 6 },
      {
        $project: {
          id: "$_id",
          name: 1,
          email: 1,
        },
      },
    ]);
    res.status(200).json({ profiles: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};
const resetpass = async (req, res, next) => {
  const { id } = req.user;
  const { currentPass, newPass } = req.body;
  if (!newPass || !currentPass)
    return res.status(400).json({ msg: "fill all the fields" });
  try {
    const user = await userSchema.findById(id);
    const isMatch = await bcrypt.compare(currentPass, user.password);

    if (!isMatch) return res.status(401).json({ msg: "wrong password" });
    const hashed_new_pass = await bcrypt.hash(newPass, SALT_ROUNDS);
    user.password = hashed_new_pass;
    await user.save();
    return res.status(200).json({ msg: "Sucessfull" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: "internal server error" });
  }
};
const forgotpassreq = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "send the email " });
  try {
    const user = await userSchema.findOne({ email });
    if (!user) return res.status(400).json({ msg: "no such user exsist" });
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      JWT_SECRET,
      {
        expiresIn: "10m",
      },
    );
    const link = `${process.env.SERVER_BASE_URL}/static/forgotpasspage.html?token=${token}`;
    const { subject, html } = forgot_pass_html(user.name, link);
    sendEmail(email, subject, html);
    return res.status(200).json({ msg: "sucessful sent" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "internal server error" });
  }
};
const forgotPass = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!password) {
      return res.status(400).json({ msg: "Password is required" });
    }

    const payload = await verifyAsync(token, JWT_SECRET);

    const user = await userSchema.findById(payload.id);
    if (!user) {
      return res.status(400).json({ msg: "No such user exists" });
    }

    const hashedNewPass = await bcrypt.hash(password, SALT_ROUNDS);

    user.password = hashedNewPass;
    await user.save();

    return res.status(200).json({ msg: "Password successfully changed" });
  } catch (err) {
    return res.status(400).json({ msg: "Token expired or invalid" });
  }
};
const deleteProfile = async (req, res) => {
  const { id } = req.user;
  const { password } = req.body;
  if (!password) return res.status(400).json({ msg: "password is required" });
  const session = await mongoose.startSession();
  try {
    const user = await userSchema.findById(id).session(session);
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Wrong password" });

    await session.withTransaction(async () => {
      const ownerIdObject = new mongoose.Types.ObjectId(id);

      const lists = await listSchema
        .find({ owner: ownerIdObject })
        .select("_id")
        .session(session);
      const listIdArray = lists.map((list) => list._id);

      const tasks = await taskSchema
        .find({
          $or: [{ owner: ownerIdObject }, { list: { $in: listIdArray } }],
        })
        .select("_id")
        .session(session);
      const taskIdArray = tasks.map((task) => task._id);

      await Promise.all([
        commentSchema.deleteMany(
          {
            $or: [{ owner: ownerIdObject }, { task: { $in: taskIdArray } }],
          },
          { session },
        ),
        taskSchema.deleteMany(
          {
            $or: [{ owner: ownerIdObject }, { list: { $in: listIdArray } }],
          },
          { session },
        ),
        taskSchema.updateMany(
          { collabrators: ownerIdObject },
          { $pull: { collabrators: ownerIdObject } },
          { session },
        ),
        listSchema.deleteMany({ owner: ownerIdObject }, { session }),
        boardSchema.deleteMany({ owner: ownerIdObject }, { session }),
        userSchema.deleteOne({ _id: ownerIdObject }, { session }),
      ]);
    });
    res.clearCookie("refresh_token");
    return res.status(200).json({ msg: "Profile deleted successfully" });
  } catch (err) {
    console.log("Error occurred while deleting profile:", err);
    return res.status(500).json({ msg: "Internal Server Error" });
  } finally {
    await session.endSession();
  }
};
export default {
  logout,
  getProfiles,
  resetpass,
  forgotpassreq,
  forgotPass,
  deleteProfile,
};
