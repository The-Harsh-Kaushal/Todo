import express from "express";
import {
  verifySession,
  refreshSession,
} from "../../../backend/src/middlewares/auth.js";
import userControllers from "../controllers/user.controller.js";
const Router = express.Router();

Router.get("/profile", verifySession, async (req, res) => {
  res.status(200).json({ msg: "Profile", user: req.user });
});
Router.get("/refreshsession", refreshSession, async (req, res) => {});
Router.get(
  "/profiles",
  verifySession,
  userControllers.getProfiles,
  (req, res) => {},
);
Router.post("/logout", verifySession, userControllers.logout, (req, res) => {});
Router.post(
  "/resetpassword",
  verifySession,
  userControllers.resetpass,
  (req, res) => {},
);
Router.post(
  "/forgetpassreq",
  userControllers.forgotpassreq,
  (req, res) => {},
);
Router.post("/forgotpass", userControllers.forgotPass, (req, res) => {});
export default Router;
