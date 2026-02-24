import { JWT_SECRET, SALT_ROUNDS } from "../config/env.js";
import userSchema from "../models/userSchema.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { sendEmail } from "../utils/send_email.js";
import { forgot_pass_html } from "../view/forgot_pass_html.js";
import util from "util";
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
  try {
    const users = await userSchema.aggregate([
      {
        $match: {
          $or: [
            { name: { $regex: `^${word}`, $options: "i" } },
            { email: { $regex: `^${word}`, $options: "i" } },
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
    res.status(500).send("Internal Server Error");
  }
};
const resetpass = async (req, res, next) => {
  const { id } = req.user;
  const { currentPass, newPass } = req.body;
  if (!newPass || !currentPass)
    return res.status(400).send("fill all the fields");
  try {
    const user = await userSchema.findById(id);
    const isMatch = await bcrypt.compare(currentPass, user.password);

    if (!isMatch) return res.status(401).send("wrong password");
    const hashed_new_pass = await bcrypt.hash(newPass, SALT_ROUNDS);
    user.password = hashed_new_pass;
    await user.save();
    return res.status(200).send("Sucessfull");
  } catch (err) {
    console.log(err);
    return res.staus(500).send("internal server error");
  }
};
const forgotpassreq = async (req, res, next) => {
  const { email } = req.body;
  if (!email) return res.status(400).send("send the email ");
  try {
    const user = await userSchema.findOne({ email });
    if (!user) return res.status(400).send("no such user exsist");
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
    return res.status(200).send("sucessful sent");
  } catch (err) {
    console.log(err);
    res.status(500).send("internal server error");
  }
};
const forgotPass = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    if (!password) {
      return res.status(400).send("Password is required");
    }

    const payload = await verifyAsync(token, JWT_SECRET);

    const user = await userSchema.findById(payload.id);
    if (!user) {
      return res.status(400).send("No such user exists");
    }

    const hashedNewPass = await bcrypt.hash(password, SALT_ROUNDS);

    user.password = hashedNewPass;
    await user.save();

    return res.status(200).send("Password successfully changed");

  } catch (err) {
    return res.status(400).send("Token expired or invalid");
  }
};
export default { logout, getProfiles, resetpass, forgotpassreq, forgotPass };
