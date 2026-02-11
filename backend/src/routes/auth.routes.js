import express from "express";
const Router = express.Router();
import authControllers from "../controllers/auth.controller.js";

Router.post("/login", authControllers.loginMiddleware, (req, res) => {});

Router.post("/signup", authControllers.signupMiddleware, (req, res) => {});

export default Router;
